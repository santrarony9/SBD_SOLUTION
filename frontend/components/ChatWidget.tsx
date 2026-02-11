'use client';

import { useState, useRef, useEffect } from 'react';
import { PiChatCircleText, PiX, PiPaperPlaneRight, PiSparkle } from "react-icons/pi";
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your Personal Concierge. How can I assist you with your jewelry journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetchAPI('/chat', {
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          message: userMessage,
          history: history,
          userId: user?.id
        })
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Connection Error: ${error.message || "Unknown error"}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse simple links like [Link: /product/slug]
  const renderContent = (text: string) => {
    // Regex to match our backend link format: [Link: /product/slug]
    const linkRegex = /\[Link: (.*?)\]/g;

    // If no links, just return text
    if (!text.match(linkRegex)) return text;

    const parts = text.split(linkRegex);
    // parts will be ["some text ", "/product/slug", " more text..."]

    return parts.map((part, i) => {
      if (part.startsWith('/') && (part.includes('product') || part.includes('shop'))) {
        return (
          <a key={i} href={part} className="text-brand-gold underline hover:text-white mx-1 font-medium transition-colors">
            View Item
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-brand-navy text-brand-gold shadow-2xl hover:scale-105 hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 flex items-center justify-center group border border-brand-gold/20"
      >
        <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-brand-navy/10 animate-pulse-slow"></div>
        <PiChatCircleText className="w-7 h-7" />
        {/* Notification Dot if needed */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Chat Window */}
      <div className="w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-brand-charcoal/10 flex flex-col h-[500px]">
        {/* Header */}
        <div className="bg-brand-navy p-4 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold-gradient opacity-5"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-gold backdrop-blur-sm border border-white/10">
              <PiSparkle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium tracking-wide text-brand-gold">SBD Concierge</h3>
              <p className="text-[9px] text-white/60 uppercase tracking-widest font-sans">AI Powered • Always Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white transition-colors relative z-10 hover:bg-white/10 p-1 rounded-full"
          >
            <PiX className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 scrollbar-thin scrollbar-thumb-brand-navy/10 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                                max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group
                                ${msg.role === 'user'
                  ? 'bg-brand-navy text-white rounded-br-none ml-8'
                  : 'bg-white border border-brand-charcoal/5 rounded-bl-none text-brand-charcoal mr-8'}
                            `}>
                <div className="break-words">
                  {renderContent(msg.content)}
                </div>
                <span className="text-[9px] opacity-40 mt-1 block w-full text-right font-mono tracking-tighter">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-brand-charcoal/5 p-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-brand-navy/60 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-navy/60 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-navy/60 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions (only if chat is somewhat empty or user hasn't typed much) */}
          {messages.length < 4 && !isLoading && (
            <div className="flex flex-wrap justify-end gap-2 mt-4 px-2">
              {['Engagement Rings?', 'Track my Order', 'Return Policy', 'Custom Design'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    // Optional: auto-send
                    // handleSend(q); 
                    // But here we just set input for user to confirm or simply set it.
                    // Let's set it and maybe user clicks send. 
                    // Better UX: auto-send if they click a chip.
                    setMessages(prev => [...prev, { role: 'user', content: q }]);
                    setIsLoading(true);
                    // We need to call API here, but handleSend relies on state 'input'. 
                    // Refactor handleSend or just duplicate logic slightly for cleanliness or use useEffect to trigger?
                    // Easiest: call a separate send function.
                    // For now, let's just set input and focus? No, user expects action.
                    // We will call the API directly here to avoid state race conditions.
                    (async () => {
                      try {
                        const history = messages.map(m => ({ role: m.role, content: m.content }));
                        // Add the new user message to history effectively
                        history.push({ role: 'user', content: q });

                        const response = await fetchAPI('/chat', {
                          method: 'POST',
                          headers: {},
                          body: JSON.stringify({
                            message: q,
                            history: history,
                            userId: user?.id
                          })
                        });

                        setMessages(prev => [...prev, { role: 'model', content: response.text }]);
                      } catch (error) {
                        console.error("Chat Error:", error);
                        setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting. Please try again." }]);
                      } finally {
                        setIsLoading(false);
                      }
                    })();
                  }}
                  className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-navy text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-brand-gold/20 transition-all hover:scale-105"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-brand-charcoal/5 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center bg-gray-50 rounded-full px-2 py-2 border border-brand-charcoal/5 focus-within:border-brand-gold/30 focus-within:bg-white transition-all shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rings, orders, or policies..."
              className="flex-1 bg-transparent border-none px-3 text-sm focus:ring-0 outline-none text-brand-navy placeholder:text-gray-400 placeholder:font-light"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center hover:bg-gold-gradient hover:text-brand-navy hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
            >
              <PiPaperPlaneRight className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[8px] text-gray-400 uppercase tracking-widest">Powered by SBD Core AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
