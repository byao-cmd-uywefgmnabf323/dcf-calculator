'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { Button } from '../ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from bot.');
      }

      const data = await response.json();
      const botMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      const errorMessage: Message = { role: 'assistant', content: `Sorry, something went wrong: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="bg-gray-800 border border-gray-700 rounded-xl flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <Bot className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">DCF Educational Chatbot</h3>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <Bot className="w-6 h-6 text-indigo-400 flex-shrink-0" />}
              <div className={`p-3 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && <User className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <div className="p-3 rounded-lg bg-gray-700">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse h-2 w-2 bg-indigo-400 rounded-full"></span>
                  <span className="animate-pulse h-2 w-2 bg-indigo-400 rounded-full delay-150"></span>
                  <span className="animate-pulse h-2 w-2 bg-indigo-400 rounded-full delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about DCF..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 pr-10 text-sm text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <Button type="submit" variant="ghost" className="absolute top-1/2 right-2 -translate-y-1/2 p-2" disabled={isLoading}>
              <CornerDownLeft size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
