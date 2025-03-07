"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Create a loading fallback component
function DialogueLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Loading conversation...</p>
      </div>
    </div>
  );
}

// Dynamically import the client component
const DialogueClient = dynamic(() => import('./DialogueClient'), {
  loading: () => <DialogueLoading />
});

// Main page component
export default function DialoguePage() {
  return (
    <Suspense fallback={<DialogueLoading />}>
      <DialogueClient />
    </Suspense>
  );
}
