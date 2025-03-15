"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { sendDialogue, resetConversation, getHistory, getConversation, HistoryEntry, clearHistory, checkApiConnection, API_BASE_URL } from '../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
}

export default function DialogueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialMessage = searchParams.get('message') || '';
  const tutorStyle = searchParams.get('style') || 'humorous';
  const aiModel = searchParams.get('model') || 'GPT-4';
  const initialGrade = searchParams.get('grade') || '3rd-grade';
  const hasUploadedFile = searchParams.get('hasUploadedFile') === 'true';
  
  // Get uploaded material from sessionStorage if available
  const [uploadedMaterial, setUploadedMaterial] = useState<string>('');
  const [materialName, setMaterialName] = useState<string>('');
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string>('');
  
  // Check API connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkApiConnection();
      setApiConnected(isConnected);
      if (!isConnected) {
        setConnectionError(`Unable to connect to the backend server at ${API_BASE_URL}. Please make sure the server is running.`);
      }
    };
    
    checkConnection();
  }, []);
  
  // Load file content from sessionStorage on component mount
  useEffect(() => {
    if (hasUploadedFile) {
      const storedMaterial = sessionStorage.getItem('uploadedMaterial') || '';
      const storedMaterialName = sessionStorage.getItem('materialName') || '';
      setUploadedMaterial(storedMaterial);
      setMaterialName(storedMaterialName);
    }
  }, [hasUploadedFile]);
  
  // Store config in refs to avoid re-renders
  const configRef = useRef({
    initialMessage,
    tutorStyle,
    aiModel,
    grade: initialGrade,
    uploadedMaterial,
    materialName
  });
  
  // Update configRef when uploadedMaterial changes
  useEffect(() => {
    configRef.current.uploadedMaterial = uploadedMaterial;
    configRef.current.materialName = materialName;
  }, [uploadedMaterial, materialName]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionMessages, setCurrentSessionMessages] = useState<Message[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatSessions, setChatSessions] = useState<HistoryEntry[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessedRef = useRef(false);
  const messageIdCounter = useRef(0);
  
  // Function to generate unique message IDs
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}`;
  };
  
  // Initialize conversation and load history when component mounts
  useEffect(() => {
    const initializeConversation = async () => {
      if (initialMessageProcessedRef.current || !apiConnected) return;
      initialMessageProcessedRef.current = true;
      
      try {
        // Reset conversation without messages first
        await resetConversation(
          configRef.current.tutorStyle as 'humorous' | 'passionate' | 'creative',
          configRef.current.grade,
          [],
          configRef.current.uploadedMaterial,
          configRef.current.materialName
        );
        
        // Load chat history first
        await loadChatHistory();
        
        // If there's an initial message, create it as the first message
        if (configRef.current.initialMessage) {
          const userMessage: Message = {
            id: generateMessageId(),
            role: 'user',
            content: configRef.current.initialMessage,
            timestamp: new Date()
          };
          setMessages([userMessage]);
          setCurrentSessionMessages([userMessage]);
          
          // Get AI response
          await simulateResponse(
            configRef.current.initialMessage, 
            configRef.current.tutorStyle, 
            configRef.current.aiModel
          );
        }
        // If there's uploaded material but no initial message, add a welcome message from the assistant
        else if (configRef.current.uploadedMaterial && !configRef.current.initialMessage) {
          // Add a welcome message from the assistant
          const welcomeMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: `I've analyzed the material "${configRef.current.materialName}" and I'm ready to help you learn from it. You can ask me questions about the content, request explanations, or discuss any part of the material that interests you.`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
          setCurrentSessionMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        setConnectionError(`Error connecting to the backend server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setApiConnected(false);
      }
    };
    
    initializeConversation();
  }, [apiConnected]); // Add apiConnected as a dependency
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const loadChatHistory = async () => {
    try {
      const history = await getHistory();
      setChatSessions(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const conversation = await getConversation(id);
      const formattedMessages: Message[] = conversation.messages.map(msg => ({
        id: generateMessageId(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      }));

      // If switching to a history record
      if (conversation.timestamp !== "Current Session") {
        if (!isViewingHistory) {
          // Save current session messages before viewing history
          setCurrentSessionMessages(messages);
        }
        setIsViewingHistory(true);
        setMessages(formattedMessages);
      } else {
        // Switching back to current session
        setIsViewingHistory(false);
        setMessages(currentSessionMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };
  
  const simulateResponse = async (userMessage: string, style: string, model: string) => {
    setIsLoading(true);
    
    try {
      const response = await sendDialogue(
        userMessage, 
        model === 'Qwen-2.5' ? 'qwen' : 'gpt',
        style as 'humorous' | 'passionate' | 'creative',
        configRef.current.grade,
        configRef.current.uploadedMaterial,
        configRef.current.materialName
      );
      
      const aiMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentSessionMessages(prev => [...prev, aiMessage]);
      return response.response;
    } catch (error) {
      console.error('Error getting response:', error);
      let errorMessage = 'Sorry, I encountered an error while processing your message. Please try again.';
      
      // Check if error is related to file size
      if (error instanceof Error && error.message.includes('413')) {
        errorMessage = 'The uploaded file is too large. Please upload a smaller file (less than 100KB).';
      } else if (error instanceof Error && error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      const errorMsg: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentSessionMessages(prev => [...prev, errorMsg]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (input.trim() === '' || isViewingHistory) return;
    
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentSessionMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Get AI response
    await simulateResponse(
      input, 
      configRef.current.tutorStyle, 
      configRef.current.aiModel
    );
  };
  
  const goToHome = () => {
    router.push('/');
  };
  
  const handleNewChat = async () => {
    try {
      // Only save if there are messages to save and we're not viewing history
      if (currentSessionMessages.length > 0 && !isViewingHistory) {
        // Save current session by resetting conversation (which will save it)
        await resetConversation(
          configRef.current.tutorStyle as 'humorous' | 'passionate' | 'creative',
          configRef.current.grade,
          currentSessionMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          configRef.current.uploadedMaterial,
          configRef.current.materialName
        );
      }
      
      // Start a new conversation
      await resetConversation(
        configRef.current.tutorStyle as 'humorous' | 'passionate' | 'creative',
        configRef.current.grade,
        [],
        configRef.current.uploadedMaterial,
        configRef.current.materialName
      );
      
      // Clear local messages
      setMessages([]);
      setCurrentSessionMessages([]);
      setIsViewingHistory(false);
      
      // Reset the initial message flag so we can process new initial messages
      initialMessageProcessedRef.current = false;
      
      // Load updated chat history to show the saved session
      await loadChatHistory();
      
      // Navigate home
      goToHome();
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };
  
  const handleClearHistory = async () => {
    try {
      await clearHistory();
      // Clear local states
      setMessages([]);
      setCurrentSessionMessages([]);
      setChatSessions([]);
      setIsViewingHistory(false);
      // Reset the initial message flag
      initialMessageProcessedRef.current = false;
      // Initialize a new conversation
      await resetConversation(configRef.current.tutorStyle as 'humorous' | 'passionate' | 'creative');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };
  
  // Render chat sessions with current session at top
  const renderChatSessions = () => {
    const currentSession = chatSessions.find(session => session.title === "Current Session");
    const pastSessions = chatSessions.filter(session => session.title !== "Current Session");

    return (
      <>
        {currentSession && (
          <div 
            key={currentSession.id}
            className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 cursor-pointer transition-colors"
            onClick={() => loadConversation(currentSession.id)}
          >
            <div className="font-medium truncate">{currentSession.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              In progress
            </div>
          </div>
        )}
        {pastSessions.map(session => (
          <div 
            key={session.id}
            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            onClick={() => loadConversation(session.id)}
          >
            <div className="font-medium truncate">{session.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {session.timestamp}
            </div>
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className="flex w-full h-screen max-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      {/* Connection error message */}
      {!apiConnected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Connection Error</h2>
            <p className="mb-4">{connectionError}</p>
            <div className="flex justify-between">
              <button 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => router.push('/')}
              >
                Return Home
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={async () => {
                  const isConnected = await checkApiConnection();
                  setApiConnected(isConnected);
                  if (!isConnected) {
                    setConnectionError(`Still unable to connect to the backend server at ${API_BASE_URL}. Please make sure the server is running.`);
                  } else {
                    initialMessageProcessedRef.current = false;
                  }
                }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar for chat history */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 shadow-md transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
        {/* Fixed header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Chat History</h2>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowSidebar(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Fixed New Chat button */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium mb-2"
            onClick={handleNewChat}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            New Chat
          </button>
          
          <button 
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            onClick={handleClearHistory}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Clear History
          </button>
        </div>
        
        {/* Scrollable history list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {renderChatSessions()}
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-white dark:bg-gray-900">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowSidebar(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <Image 
                src="/qcast-logo.svg" 
                alt="QCAST ESL Logo" 
                width={28} 
                height={28} 
                className="rounded-md"
              />
              <h1 className="font-semibold text-lg">QCAST ESL Tutor</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 font-medium">
              {configRef.current.tutorStyle.charAt(0).toUpperCase() + configRef.current.tutorStyle.slice(1)}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 font-medium">
              {configRef.current.aiModel}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 font-medium">
              {configRef.current.materialName ? (
                <span title={configRef.current.materialName} className="truncate max-w-[120px] inline-block">
                  {configRef.current.materialName}
                </span>
              ) : (
                configRef.current.grade.split('-')[0].charAt(0).toUpperCase() + configRef.current.grade.split('-')[0].slice(1)
              )}
            </span>
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose dark:prose-invert prose-sm sm:prose-base" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                ) : (
                  <p className="text-base leading-relaxed">{message.content}</p>
                )}
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 max-w-6xl">
            {isViewingHistory && (
              <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
                Viewing history - Switch to current session to continue chatting
              </div>
            )}
            {!isViewingHistory && (
              <>
                <div className="relative flex-1 flex items-center h-10">
                  <input
                    type="text"
                    className="w-full h-full px-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <button 
                  className="h-10 w-16 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={input.trim() === '' || isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 