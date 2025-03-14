def indicates_switch_tutor(text):
    """Simple string matching to detect teaching style changes."""
    text = text.lower()
    
    if any(word in text for word in ['funny', 'humor', 'humorous', 'joke', 'laugh']):
        return 'humorous'
    elif any(word in text for word in ['passion', 'passionate', 'enthusiasm', 'enthusiastic']):
        return 'passionate'
    elif any(word in text for word in ['creative', 'creativity', 'innovative', 'experiment']):
        return 'creative'
    
    return None

def process_text(text):
    # This is a placeholder for your actual NLP processing logic
    # You should integrate this with your existing NLP functionality
    
    # For now, we'll just return a simple response
    return f"You said: {text}"


