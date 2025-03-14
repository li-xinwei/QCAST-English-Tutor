import os
import dashscope
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import desc
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
from nlp import indicates_switch_tutor
from systemMessage import Tutor
from switchTextbook import switchTextbook
from dashscope import Generation
from openai import OpenAI
from flask_cors import CORS

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

class Base(DeclarativeBase):
    pass

completions = []

# Global variables to store current state
current_textbook = '3rd-grade'  # Default grade
teaching_style = 'humorous'     # Default style
messages_history = []           # Store conversation history
current_history_id = None       # Store the ID of the current conversation

dashscope.api_key = os.environ.get('DASHSCOPE_API_KEY', 'sk-92606777cb7748e8916082663128fe09')

# Initialize OpenAI client with API key from environment
openai_api_key = os.environ.get('OPENAI_API_KEY')
try:
    if not openai_api_key:
        print("Warning: OPENAI_API_KEY not set. GPT-4 functionality will be disabled.")
        client = None
    else:
        client = OpenAI(
            api_key=openai_api_key,
            base_url="https://api.openai.com/v1"  # Explicitly set the base URL
        )
except Exception as e:
    print(f"Error initializing OpenAI client: {str(e)}")
    client = None

model = 'gpt'  # Default model is GPT

app = Flask(__name__)
# Configure CORS to allow requests from the frontend
CORS(app, resources={
    r"/*": {  # Allow all routes
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Ensure all responses have CORS headers
@app.after_request
def after_request(response):
    # Get origin from request
    origin = request.headers.get('Origin')
    # If origin is in allowed origins, set it in response
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
db = SQLAlchemy(model_class=Base)
db.init_app(app)

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    init = db.Column(db.String)
    content = db.Column(JSON)

    def to_dict(self):
        return {
            'id': self.id,
            'init': self.init,
            'content': self.content
        }

    @staticmethod
    def from_dict(data):
        history = History()
        history.init = data.get('init')
        history.content = data.get('content', [])
        return history

history_viewing=History()
with app.app_context():
    db.create_all()


def add_message(role, message):
    completion = {'role': role, 'content': message}
    completions.append(completion)


def genRes(message, model):
    try:
        if model == 'qwen':
            response = Generation.call(
                "qwen2-72b-instruct",
                messages=message,
                result_format='message',
            )
            
            if response and hasattr(response, 'output') and hasattr(response.output, 'choices'):
                return response.output.choices[0]['message']['content']
            else:
                print("Error: Invalid response from Qwen API")
                return "I'm sorry, I couldn't process your request at the moment. Please try again later."
                
        elif model == 'gpt':
            if client is None:
                print("GPT-4 functionality is disabled. Falling back to Qwen.")
                return genRes(message, 'qwen')
                
            try:
                response = client.chat.completions.create(
                    model='gpt-4',
                    messages=message
                )
                
                if response and hasattr(response, 'choices') and len(response.choices) > 0:
                    return response.choices[0].message.content
                else:
                    print("Error: Invalid response from OpenAI API")
                    return "I'm sorry, I couldn't process your request at the moment. Please try again later."
            except Exception as e:
                print(f"Error with OpenAI API: {str(e)}")
                print("Falling back to Qwen model")
                return genRes(message, 'qwen')
    except Exception as e:
        print(f"Error in genRes: {str(e)}")
        return "I encountered an error while processing your request. Please try again later."





@app.route('/')
def welcome():
    return render_template('index.html',teaching_style=teaching_style)

# Legacy routes - disabled
# @app.route('/dialogue', methods=['POST'])
# def chat():
#     global history_viewing
#     add_message('user', request.form.get('question'))
#     abstract = datetime.now().strftime("%Y-%m-%d %H:%M")
#     if model=='gpt':
#         assistant_response = genRes(completions,'gpt')
#     else:
#         assistant_response = genRes(completions,'qwen')
#     add_message('assistant', assistant_response)
#     history = History(init=abstract, content=completions)
#     db.session.add(history)
#     db.session.commit()
#     histories=History.query.order_by(desc(History.id)).all()
#     history_viewing=history
#     return render_template('dialogue.html', completions=[completion for completion in completions if completion['role']!='system'], histories=histories)

# @app.route('/dialogue/continue', methods=['POST'])
# def continued():
#     global completions
#     global current_textbook
#     global teaching_style
#     completions=history_viewing.content
#     if switchTextbook(request.form.get('message')) in ['1st-grade','2nd-grade','3rd-grade','4th-grade','5th-grade','6th-grade']:
#         print('textbook changed')
#         current_textbook=switchTextbook(request.form.get('message'))
#         if teaching_style=='humorous':
#             add_message('system', Tutor(style='humorous',grade=current_textbook).load_tutor())
#         elif teaching_style=='passionate':
#             add_message('system', Tutor(style='passionate',grade=current_textbook).load_tutor())
#         elif teaching_style=='creative':
#             add_message('system', Tutor(style='creative',grade=current_textbook).load_tutor())
#     if indicates_switch_tutor(request.form.get('message'))=='humorous':
#         print('switched to humorous')
#         add_message('system',Tutor(style='humorous',grade=current_textbook).load_tutor())
#         teaching_style='humorous'
#     elif indicates_switch_tutor(request.form.get('message'))=='passionate':
#         print('switch to passionate')
#         add_message('system',Tutor(style='passionate',grade=current_textbook).load_tutor())
#         teaching_style='passionate'
#     elif indicates_switch_tutor(request.form.get('message'))=='creative':
#         print('switch to creative')
#         add_message('system',Tutor(style='creative',grade=current_textbook).load_tutor())
#         teaching_style='creative'
#     add_message('user', request.form.get('message'))
#     histories = History.query.order_by(desc(History.id)).all()
#     if model=='gpt':
#         assistant_response = genRes(completions,'gpt')
#     else:
#         assistant_response = genRes(completions,'qwen')
#     add_message('assistant', assistant_response)
#     with app.app_context():
#         modified_item=History.query.get_or_404(history_viewing.id)
#         modified_item.content=[message for message in completions]
#         db.session.flush()
#         db.session.commit()
#     return render_template('dialogue.html', completions=[completion for completion in completions if completion['role']!='system'], histories=histories)

@app.route('/save_record',methods=['POST'])
def saveRecord():


    completions.clear()

    return redirect(url_for('welcome'))


@app.route('/display_history',methods=['POST'])
def displayHistory():

    global history_viewing
    history_id=request.form.get('history_id')
    history=History.query.get_or_404(history_id)
    histories = History.query.order_by(desc(History.id)).all()

    history_viewing=history
    return render_template('dialogue.html',completions=[content for content in history.content if content['role']!='system'],histories=histories)

@app.route('/style_selection',methods=['POST'])
def selectStyle():
    global teaching_style
    if 'humorous' in request.form:
        add_message('system',Tutor(style='humorous',grade=current_textbook).load_tutor())
        teaching_style="humorous"
    elif 'passionate' in request.form:
        add_message('system',Tutor(style='passionate',grade=current_textbook).load_tutor())
        teaching_style="passionate"
    else:
        add_message('system',Tutor(style='creative',grade=current_textbook).load_tutor())
        teaching_style="creative"


    return render_template('index.html',teaching_style=teaching_style,model=model)

@app.route('/model_selection',methods=['POST'])
def selectModel():
    global model
    if 'gpt' in request.form:
        model='gpt'
    elif 'qwen' in request.form:
        model='qwen'
    print(model)
    return render_template('index.html', model=model,teaching_style=teaching_style)

# API endpoint for dialogue processing
@app.route('/api/dialogue', methods=['POST'])
def process_dialogue():
    global messages_history, current_textbook, teaching_style, current_history_id
    
    try:
        data = request.json
        selected_model = data.get('model', 'gpt')
        user_message = data.get('text', '').strip()
        style = data.get('style', teaching_style)
        grade = data.get('grade')  # Get grade from request
        
        print(f"Received request - Grade: {grade}, Style: {style}, Model: {selected_model}")
        
        # Check if grade has changed
        grade_changed = grade and grade != current_textbook
        if grade_changed:
            print(f"Grade changed from {current_textbook} to {grade}")
            current_textbook = grade
            
            # Save current conversation if it exists
            if current_history_id and messages_history:
                current_history = History.query.get(current_history_id)
                if current_history:
                    # Save as completed conversation if it has chat messages
                    chat_messages = [msg for msg in messages_history if msg.get('role') != 'system']
                    if chat_messages:
                        save_conversation(messages_history, is_current=False)
                    # Delete current session
                    db.session.delete(current_history)
                    db.session.commit()
            
            # Initialize new conversation with new grade
            print(f"Initializing new conversation with grade {current_textbook}")
            tutor = Tutor(grade=current_textbook, style=style)
            system_message = {'role': 'system', 'content': tutor.load_tutor()}
            messages_history = [system_message]
            current_history_id = save_conversation(messages_history, is_current=True)
        
        # Initialize messages if this is a new conversation
        elif not messages_history or current_history_id is None:
            print(f"Initializing new conversation with grade {current_textbook}")
            tutor = Tutor(grade=current_textbook, style=style)
            system_message = {'role': 'system', 'content': tutor.load_tutor()}
            messages_history = [system_message]
            current_history_id = save_conversation(messages_history, is_current=True)
        
        # Process user message
        if user_message:
            print(f"Processing user message: {user_message[:50]}...")
            # Add user message
            user_message_obj = {'role': 'user', 'content': user_message}
            messages_history.append(user_message_obj)
            
            # Generate and add assistant response
            response_text = genRes(messages_history, selected_model)
            if response_text:
                assistant_message = {'role': 'assistant', 'content': response_text}
                messages_history.append(assistant_message)
                
                # Update current session
                if current_history_id:
                    current_history = History.query.get(current_history_id)
                    if current_history:
                        current_history.content = list(messages_history)  # Create a new list copy
                        db.session.commit()
                    else:
                        # If current_history was deleted, create new one
                        current_history_id = save_conversation(messages_history, is_current=True)
                else:
                    current_history_id = save_conversation(messages_history, is_current=True)
                
                return jsonify({'response': response_text})
            
        return jsonify({'error': 'Invalid message or response'}), 400
        
    except Exception as e:
        print(f"Error in process_dialogue: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        histories = History.query.order_by(desc(History.id)).all()
        history_list = []
        current_session = None
        
        for history in histories:
            if not history.content:  # Skip empty histories
                continue
                
            # Get messages excluding system messages
            chat_messages = [msg for msg in history.content if msg.get('role') != 'system']
            
            # For current session, include even if empty
            if history.init == "Current Session":
                current_session = {
                    'id': history.id,
                    'title': "Current Session",
                    'timestamp': history.init,
                    'messages': chat_messages
                }
            # For completed conversations, only include if they have chat messages
            elif chat_messages:
                first_user_msg = next((msg['content'][:50] + "..." for msg in chat_messages 
                                     if msg.get('role') == 'user'), None)
                if first_user_msg:
                    history_list.append({
                        'id': history.id,
                        'title': first_user_msg,
                        'timestamp': history.init,
                        'messages': chat_messages
                    })
        
        # Put current session at top if it exists
        if current_session:
            history_list.insert(0, current_session)
            
        return jsonify(history_list)
        
    except Exception as e:
        print(f"Error in get_history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history/<int:history_id>', methods=['GET'])
def get_conversation(history_id):
    try:
        history = History.query.get_or_404(history_id)
        if not history.content:
            return jsonify({'error': 'Empty conversation'}), 404
            
        # Update global state with the loaded conversation
        global messages_history, current_history_id
        messages_history = history.content
        current_history_id = history.id
        
        # Return non-system messages for display
        display_messages = [msg for msg in history.content if msg.get('role') != 'system']
        
        return jsonify({
            'id': history.id,
            'timestamp': history.init,
            'messages': display_messages
        })
        
    except Exception as e:
        print(f"Error loading conversation {history_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    global messages_history, current_textbook, teaching_style, current_history_id
    
    try:
        data = request.json
        new_style = data.get('style', teaching_style)
        new_grade = data.get('grade', current_textbook)
        
        # Save current session if it has messages
        if current_history_id and messages_history:
            current_history = History.query.get(current_history_id)
            if current_history and current_history.init == "Current Session":
                # Get non-system messages
                chat_messages = [msg for msg in messages_history if msg.get('role') != 'system']
                if chat_messages:  # Only save if there are actual chat messages
                    # Save as completed conversation
                    save_conversation(messages_history, is_current=False)
                # Always delete the current session
                db.session.delete(current_history)
                db.session.commit()
        
        # Update global state
        teaching_style = new_style
        current_textbook = new_grade
        
        # Initialize new conversation
        tutor = Tutor(grade=current_textbook, style=new_style)
        system_message = {'role': 'system', 'content': tutor.load_tutor()}
        messages_history = [system_message]
        
        # Create new current session
        current_history_id = save_conversation(messages_history, is_current=True)
        if not current_history_id:
            return jsonify({'error': 'Failed to create new session'}), 500
            
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"Error in reset_conversation: {str(e)}")
        return jsonify({'error': str(e)}), 500

def save_conversation(messages, is_current=False):
    """Helper function to save conversation to database"""
    try:
        if not messages:
            return None
            
        # Ensure we have a copy of messages to avoid reference issues
        messages_copy = list(messages)
        
        # Keep system message if it exists
        system_message = next((msg for msg in messages_copy if msg.get('role') == 'system'), None)
        
        # Get non-system messages
        chat_messages = [msg for msg in messages_copy if msg.get('role') != 'system']
        
        # For current session, always save if we have a system message
        if is_current:
            if system_message:
                final_messages = [system_message] + chat_messages
                history = History(init="Current Session", content=final_messages)
                db.session.add(history)
                db.session.commit()
                return history.id
            return None
            
        # For completed conversations, save if we have any chat messages
        if chat_messages:
            final_messages = ([system_message] if system_message else []) + chat_messages
            history = History(init=datetime.now().strftime("%Y-%m-%d %H:%M"), content=final_messages)
            db.session.add(history)
            db.session.commit()
            return history.id
            
        return None
    except Exception as e:
        print(f"Error saving conversation: {str(e)}")
        db.session.rollback()
        return None

def load_conversation(history_id):
    """Helper function to load conversation from database"""
    try:
        history = History.query.get(history_id)
        if not history:
            return None
        return history.content
    except Exception as e:
        print(f"Error loading conversation: {str(e)}")
        return None

@app.route('/api/history/clear', methods=['POST'])
def clear_history():
    try:
        # Delete all history records
        History.query.delete()
        # Reset global state
        global messages_history, current_history_id
        messages_history = []
        current_history_id = None
        # Commit the changes
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error clearing history: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/textbook/upload', methods=['POST'])
def upload_textbook():
    try:
        data = request.json
        content = data.get('content')
        grade = data.get('grade')
        
        if not content or not grade:
            return jsonify({'error': 'Missing content or grade'}), 400
            
        # Save the textbook content to a file
        with open(f'./file/{grade}.txt', 'w', encoding='utf-8') as f:
            f.write(content)
            
        # Update global state
        global current_textbook
        current_textbook = grade
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"Error uploading textbook: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Error handler for all exceptions
@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error: {str(error)}")
    response = jsonify({
        "error": str(error),
        "message": "An error occurred while processing your request"
    })
    response.status_code = 500
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5001)
