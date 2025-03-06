"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  
  const handleStartChat = () => {
    if (userQuery.trim() && selectedStyle && selectedModel) {
      router.push(`/dialogue?message=${encodeURIComponent(userQuery)}&style=${selectedStyle}&model=${selectedModel}`);
    }
  };
  
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-3xl text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image 
            src="/qcast-logo.svg" 
            alt="QCAST ESL Logo" 
            width={48} 
            height={48} 
            className="rounded-lg"
          />
          <h1 className="text-3xl font-bold">QCAST ESL English Tutor</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Your AI companion for language learning</p>
      </header>
      
      <main className="flex flex-col gap-8 w-full max-w-3xl">
        {/* Chat input area */}
        <div className="w-full">
          <div className="relative">
            <input 
              type="text" 
              placeholder="What would you like to learn today?"
              className="w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              onClick={handleStartChat}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tutor style selection */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-3">Choose your tutor style:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              className={`p-4 rounded-lg border transition-colors ${
                selectedStyle === 'humorous' 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('humorous')}
            >
              <h3 className="font-bold">Humorous</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Learn with jokes and fun examples</p>
            </button>
            
            <button 
              className={`p-4 rounded-lg border transition-colors ${
                selectedStyle === 'creative' 
                  ? 'bg-purple-100 dark:bg-purple-900 border-purple-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('creative')}
            >
              <h3 className="font-bold">Creative</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Imaginative scenarios and storytelling</p>
            </button>
            
            <button 
              className={`p-4 rounded-lg border transition-colors ${
                selectedStyle === 'passionate' 
                  ? 'bg-red-100 dark:bg-red-900 border-red-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('passionate')}
            >
              <h3 className="font-bold">Passionate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Enthusiastic and motivating approach</p>
            </button>
          </div>
        </div>
        
        {/* Model selection */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-3">Choose your AI model:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              className={`p-4 rounded-lg border transition-colors ${
                selectedModel === 'gpt4' 
                  ? 'bg-green-100 dark:bg-green-900 border-green-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedModel('gpt4')}
            >
              <h3 className="font-bold">GPT-4</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Advanced language capabilities</p>
            </button>
            
            <button 
              className={`p-4 rounded-lg border transition-colors ${
                selectedModel === 'qwen25' 
                  ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedModel('qwen25')}
            >
              <h3 className="font-bold">Qwen-2.5</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Specialized language learning focus</p>
            </button>
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-3xl text-center text-sm text-gray-500">
        <p className="mb-1">QCAST ESL - Powered by AI language models to help you learn English effectively</p>
        <p>Created by Xinwei Li</p>
      </footer>
    </div>
  );
}
