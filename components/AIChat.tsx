import React, { useState, useRef, useEffect } from 'react';
import { Asset, ChatMessage } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

interface AIChatProps {
  assets: Asset[];
}

export const AIChat: React.FC<AIChatProps> = ({ assets }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Nexus, your intelligent asset assistant. I have access to your full inventory data. Ask me anything like:\n\n• How many laptops are available?\n• Who has the most expensive equipment?\n• Generate a summary of assets needing repair.",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Call Gemini Service
    const responseText = await analyzeInventory(input, assets);

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-200">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Nexus AI Assistant</h3>
          <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'model' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}
            `}>
              {msg.role === 'model' ? <Bot size={18} /> : <User size={18} />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}
            `}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
               <Bot size={18} />
             </div>
             <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
               <Loader2 size={16} className="animate-spin text-indigo-600" />
               <span className="text-sm text-slate-500">Analyzing inventory data...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your inventory..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none h-12 max-h-32 py-2.5 px-3 text-sm text-slate-800 placeholder:text-slate-400"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors mb-0.5"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    </div>
  );
};