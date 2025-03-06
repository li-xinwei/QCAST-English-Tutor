"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { marked } from 'marked';

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

export default function DialoguePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialMessage = searchParams.get('message') || '';
  const tutorStyle = searchParams.get('style') || 'humorous';
  const aiModel = searchParams.get('model') || 'gpt4';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    { id: '1', title: 'Current Session', lastMessage: new Date() }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track whether we've already processed the initial message
  const initialMessageProcessedRef = useRef(false);
  
  // Simulate initial AI response
  useEffect(() => {
    // Only process the initial message once
    if (initialMessage && !initialMessageProcessedRef.current) {
      initialMessageProcessedRef.current = true;
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      };
      
      setMessages([userMessage]);
      simulateResponse(initialMessage, tutorStyle, aiModel);
    }
  }, [initialMessage, tutorStyle, aiModel]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const simulateResponse = (userMessage: string, style: string, model: string) => {
    setIsLoading(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      let response = '';
      
      // Generate different responses based on tutor style
      if (style === 'humorous') {
        response = `Well, that's a great question! 😄 Let me put on my comedy hat and help you with "${userMessage}". 
        
As your humorous English tutor, I'll make learning fun while we tackle this together. Remember, the only thing more confusing than English grammar is trying to fold a fitted sheet!

Let's break this down in a way that'll make you smile while you learn...`;
      } else if (style === 'creative') {
        response = `Ah, an interesting query about "${userMessage}"! 
        
Imagine we're explorers in the vast jungle of English language, and this question is like discovering a mysterious temple. Let's venture inside together and uncover its secrets!

I'll craft a unique story to help you understand this concept...`;
      } else {
        response = `I'm absolutely thrilled you asked about "${userMessage}"! 
        
This is such an important topic in English learning, and I'm excited to guide you through it with enthusiasm and clarity. Your language journey matters deeply to me!

Let's dive in with energy and purpose...`;
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    simulateResponse(input, tutorStyle, aiModel);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Just simulate file upload for now
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `[Uploaded file: ${file.name}]`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    simulateResponse(`I've uploaded a file called ${file.name}`, tutorStyle, aiModel);
  };
  
  const goToHome = () => {
    router.push('/');
  };
  
  return (
    <div className="flex w-full h-screen max-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar for chat history */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 shadow-md transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center gap-2">
            <Image 
              src="/qcast-logo.svg" 
              alt="QCAST ESL Logo" 
              width={28} 
              height={28} 
              className="rounded-md"
            />
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
        
        <div className="p-4">
          <button 
            className="w-full flex items-center justify-center gap-2 p-3 mb-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            onClick={goToHome}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            New Chat
          </button>
          
          <div className="space-y-2">
            {chatSessions.map(session => (
              <div 
                key={session.id}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="font-medium truncate">{session.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {session.lastMessage.toLocaleDateString()}
                </div>
              </div>
            ))}
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
              {tutorStyle.charAt(0).toUpperCase() + tutorStyle.slice(1)}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 font-medium">
              {aiModel}
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
            <button 
              className="h-10 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <label className="cursor-pointer flex items-center justify-center w-full h-full">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </label>
            </button>
            
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
          </div>
        </div>
      </div>
    </div>
  );
}
