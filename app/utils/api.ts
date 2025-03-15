// Get the API base URL from environment variables, fallback to localhost for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Add a helper function to check if the API is reachable
export async function checkApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Set a short timeout to quickly detect if the server is unreachable
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
}

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

// Helper function to handle API errors
async function apiRequest<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export async function sendDialogue(
  text: string, 
  model: 'gpt' | 'qwen' = 'gpt',
  style: 'humorous' | 'passionate' | 'creative' = 'humorous',
  grade: string = '3rd-grade',
  material?: string,
  materialName?: string
): Promise<DialogueResponse> {
  const payload: any = { text, model, style };
  
  // Only include grade if it's provided and not empty
  if (grade) {
    payload.grade = grade;
  }
  
  // Include material and materialName if provided
  if (material && materialName) {
    payload.material = material;
    payload.materialName = materialName;
  }
  
  return apiRequest<DialogueResponse>(`${API_BASE_URL}/api/dialogue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return apiRequest<HistoryEntry[]>(`${API_BASE_URL}/api/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getConversation(id: number): Promise<ConversationResponse> {
  return apiRequest<ConversationResponse>(`${API_BASE_URL}/api/history/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function resetConversation(
  style: 'humorous' | 'passionate' | 'creative' = 'humorous',
  grade: string = '3rd-grade',
  messages: Array<{role: 'user' | 'assistant', content: string}> = [],
  material?: string,
  materialName?: string
): Promise<ResetResponse> {
  const payload: any = { style, messages };
  
  // Only include grade if no material is provided
  if (!material && grade) {
    payload.grade = grade;
  }
  
  // Include material and materialName if provided
  if (material && materialName) {
    payload.material = material;
    payload.materialName = materialName;
  }
  
  return apiRequest<ResetResponse>(`${API_BASE_URL}/api/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function clearHistory(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`${API_BASE_URL}/api/history/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 
