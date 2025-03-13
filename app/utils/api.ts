export const API_BASE_URL = 'http://localhost:5001';

export interface DialogueResponse {
  response: string;
}

export interface ResetResponse {
  status: string;
}

export interface HistoryEntry {
  id: number;
  title: string;
  timestamp: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ConversationResponse {
  id: number;
  timestamp: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function sendDialogue(
  text: string, 
  model: 'gpt' | 'qwen' = 'gpt',
  style: 'humorous' | 'passionate' | 'creative' = 'humorous',
  grade: string = '3rd-grade'
): Promise<DialogueResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dialogue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model, style, grade }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('Error sending dialogue:', error);
    throw error;
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

export async function getConversation(id: number): Promise<ConversationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function resetConversation(
  style: 'humorous' | 'passionate' | 'creative' = 'humorous',
  grade: string = '3rd-grade',
  messages: Array<{role: 'user' | 'assistant', content: string}> = []
): Promise<ResetResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ style, grade, messages }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('Error resetting conversation:', error);
    throw error;
  }
}

export async function clearHistory(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}

export async function uploadTextbook(content: string, grade: string): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/textbook/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, grade }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('Error uploading textbook:', error);
    throw error;
  }
} 
