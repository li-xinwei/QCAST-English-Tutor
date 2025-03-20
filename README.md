# QCAST English Tutor

QCAST English Tutor is an AI-powered educational application designed to help English as a Second Language (ESL) learners improve their English skills through interactive conversations and personalized learning experiences.

![QCAST ESL Logo](/public/qcast-logo.svg)

## Features

- **Interactive AI Tutor**: Engage in natural conversations with an AI tutor that adapts to your English proficiency level
- **Customizable Teaching Styles**: Choose from multiple teaching styles (humorous, encouraging, socratic)
- **AI Model Selection**: Options to use GPT-4 or other AI models for conversations
- **Grade-Level Adaptation**: Content tailored to different grade levels for appropriate learning challenges
- **Material Upload**: Upload your own learning materials for the AI to teach from or reference
- **Conversation History**: Save and review past learning sessions

## Technology Stack

### Frontend
- Next.js 15 with App Router
- React 19
- TypeScript
- TailwindCSS

### Backend
- Flask (Python)
- SQLAlchemy for database management
- OpenAI API integration (GPT-4)
- DashScope API integration (alternative AI model)
- PostgreSQL/SQLite database options

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- API keys for OpenAI and/or DashScope

### Installation

1. Clone the repository
```bash
git clone https://github.com/li-xinwei/qcast-english-tutor.git
cd qcast-english-tutor
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key
     DASHSCOPE_API_KEY=your_dashscope_api_key
     ```

### Running the Application

1. Start the backend server
```bash
cd backend
./start.sh
# Or run manually:
# flask run --port=5000
```

2. Start the frontend development server
```bash
# From the project root
npm run dev
```

3. Open your browser and navigate to http://localhost:3000

## Usage

1. On the home page, enter a question or topic you'd like to learn about
2. Choose your preferred teaching style and AI model
3. Select your grade level or upload your own learning material
4. Start the conversation and interact with your AI English tutor
5. Access your conversation history from previous sessions

## Deployment

The application is configured for easy deployment on platforms like Vercel (frontend) and Railway (backend).

## Limitations

- File uploads are limited to 100KB text files only (.txt, .md, .json)
- PDF files are not currently supported

## Contributing

Contributions to improve QCAST English Tutor are welcome. Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Developed by Xinwei Li - [GitHub](https://github.com/li-xinwei)
