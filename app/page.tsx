"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string>('humorous');
  const [selectedModel, setSelectedModel] = useState<string>('GPT-4');
  const [selectedGrade, setSelectedGrade] = useState<string>('3rd-grade');
  const [userQuery, setUserQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const handleStartChat = () => {
    if (userQuery.trim() || uploadedFile) {
      const params = new URLSearchParams({
        style: selectedStyle,
        model: selectedModel,
        grade: selectedGrade
      });
      
      if (userQuery.trim()) {
        params.append('message', userQuery);
      }
      
      if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          params.append('material', content);
          params.append('materialName', uploadedFile.name);
          router.push(`/dialogue?${params.toString()}`);
        };
        reader.readAsText(uploadedFile);
      } else {
        router.push(`/dialogue?${params.toString()}`);
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-3 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-2xl text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image 
            src="/qcast-logo.svg" 
            alt="QCAST ESL Logo" 
            width={40} 
            height={40} 
            className="rounded-lg"
          />
          <h1 className="text-3xl font-bold">QCAST ESL English Tutor</h1>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300">Your AI companion for English learning as ESL</p>
      </header>
      
      <main className="flex flex-col gap-5 w-full max-w-2xl">
        {/* Chat input area */}
        <div className="w-full mb-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="What would you like to learn today?"
              className="w-full p-4 pr-12 text-base rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        {/* Style selection */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Choose your teaching style:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              className={`p-3 rounded-lg border transition-colors ${
                selectedStyle === 'humorous' 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('humorous')}
            >
              <h3 className="font-bold text-sm">Humorous</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Fun and engaging teaching style</p>
            </button>
            
            <button 
              className={`p-3 rounded-lg border transition-colors ${
                selectedStyle === 'passionate' 
                  ? 'bg-red-100 dark:bg-red-900 border-red-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('passionate')}
            >
              <h3 className="font-bold text-sm">Passionate</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Enthusiastic and motivating approach</p>
            </button>
            
            <button 
              className={`p-3 rounded-lg border transition-colors ${
                selectedStyle === 'creative' 
                  ? 'bg-purple-100 dark:bg-purple-900 border-purple-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStyle('creative')}
            >
              <h3 className="font-bold text-sm">Creative</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Innovative and experimental methods</p>
            </button>
          </div>
        </div>
        
        {/* Model selection */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Choose your AI model:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              className={`p-3 rounded-lg border transition-colors ${
                selectedModel === 'GPT-4' 
                  ? 'bg-green-100 dark:bg-green-900 border-green-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedModel('GPT-4')}
            >
              <h3 className="font-bold text-sm">GPT-4</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Advanced language capabilities</p>
            </button>
            
            <button 
              className={`p-3 rounded-lg border transition-colors ${
                selectedModel === 'Qwen-2.5' 
                  ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500' 
                  : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedModel('Qwen-2.5')}
            >
              <h3 className="font-bold text-sm">Qwen-2.5</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Specialized language learning focus</p>
            </button>
          </div>
        </div>

        {/* Grade selection */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Choose your grade:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {['1st-grade', '2nd-grade', '3rd-grade', '4th-grade', '5th-grade', '6th-grade'].map((grade) => (
              <button 
                key={grade}
                className={`p-2 rounded-lg border transition-colors ${
                  selectedGrade === grade 
                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' 
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedGrade(grade)}
              >
                <h3 className="font-bold text-sm">{grade.split('-')[0].charAt(0).toUpperCase() + grade.split('-')[0].slice(1)}</h3>
              </button>
            ))}
          </div>
        </div>
        
        {/* File upload area */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-2">Or upload your own material:</h2>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`p-3 rounded-lg border-2 border-dashed transition-colors ${
                uploadedFile 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-500'
              }`}>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".txt,.json,.md,.pdf"
                />
                <div className="flex flex-col items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {uploadedFile ? (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {uploadedFile.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Click to upload a file (.txt, .json, .md, .pdf)
                    </span>
                  )}
                </div>
              </div>
            </label>
            {uploadedFile && (
              <button
                className="p-1.5 text-red-500 hover:text-red-600"
                onClick={() => setUploadedFile(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-2xl text-center text-xs text-gray-500 mt-6">
        <p className="mb-1">QCAST ESL English Tutor - Powered by AI language models to help you learn English effectively</p>
        <p>Created by Xinwei Li</p>
      </footer>
    </div>
  );
}
