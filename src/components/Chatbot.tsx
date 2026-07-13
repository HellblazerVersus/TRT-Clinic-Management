'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, User, Bot, Activity } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'Hi! I am your TRT health guide. How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Mock response logic
    setTimeout(() => {
      let botReply = "I'm here to help. Could you provide more details?";
      const lowerInput = newMsg.text.toLowerCase();

      if (lowerInput.includes('labs') || lowerInput.includes('blood')) {
        botReply = "You can view your latest lab results on the dashboard. I can also help explain specific markers like Total Testosterone or Hematocrit. Just ask!";
      } else if (lowerInput.includes('protocol') || lowerInput.includes('dose')) {
        botReply = "Your current protocol is listed on your dashboard. Please refer to the Explain section to understand how your dose frequency affects your levels.";
      } else if (lowerInput.includes('explain') || lowerInput.includes('what is trt')) {
        botReply = "Check out our 'Explain' page! It has a comprehensive guide on Testosterone Replacement Therapy from a patient's perspective.";
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-teal-500 hover:bg-teal-400 text-white rounded-full shadow-lg shadow-teal-500/20 transition-all z-50 flex items-center justify-center hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] max-w-[90vw] bg-surface-100/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-surface-200/50 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-full text-teal-400">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Health Guide</h3>
              <p className="text-xs text-gray-400">Always online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-surface-300 text-gray-300' : 'bg-teal-500 text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === 'user'
                      ? 'bg-surface-300 text-white rounded-tr-sm'
                      : 'bg-teal-500/10 border border-teal-500/20 text-gray-200 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-gray-200 rounded-tl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500/60 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500/60 animate-bounce delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500/60 animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-surface-200/50 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 bg-surface-300/50 border border-white/5 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-teal-500 text-white rounded-full disabled:opacity-50 hover:bg-teal-400 transition-colors shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
