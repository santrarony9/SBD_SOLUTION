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
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    const linkRegex = /\[(?:Link|whatsapp): (.*?)\]/g;

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
      if (part.startsWith('whatsapp:')) {
        const message = encodeURIComponent(part.split('whatsapp:')[1] || "Hello, I need assistance with Spark Blue Diamond.");
        const whatsappUrl = `https://wa.me/919876543210?text=${message}`; // Using Samarjeet's number as base
        return (
          <a
            key={i}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#128C7E] transition-all my-2 shadow-md hover:scale-105"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat on WhatsApp
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isMounted) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-28 md:bottom-8 right-4 md:right-8 z-[80] flex items-center group">
        {/* Hover Label */}
        <span className="bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-l-full border-y border-l border-brand-gold/30 shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hidden md:block">
          Chat with Concierge
        </span>

        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-navy text-brand-gold shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-110 hover:bg-gold-gradient hover:text-brand-navy transition-all duration-500 flex items-center justify-center border border-brand-gold/30 backdrop-blur-md animate-float"
        >
          <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse-slow"></div>
          <PiChatCircleText className="w-8 h-8" />

          {/* Status Indicator */}
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-navy"></span>

          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-brand-gold/20 animate-ping opacity-20"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 z-[9999] flex flex-col items-end animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
      {/* Mobile Backdrop - Semi-transparent */}
      <div className="md:hidden absolute inset-0 bg-brand-navy/20 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)}></div>

      {/* Chat Window */}
      <div className="w-full h-full md:w-[400px] md:h-[600px] md:max-h-[80vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden border-t md:border border-brand-charcoal/10 flex flex-col pointer-events-auto relative mt-auto">
        {/* Header */}
        <div className="bg-brand-navy p-5 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold-gradient opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-gold backdrop-blur-md border border-white/10 shadow-inner">
              <PiSparkle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-base font-medium tracking-wider text-brand-gold">Royal Concierge</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-sans">Artificial Intelligence • Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/40 hover:text-white transition-all relative z-10 hover:bg-white/10 p-2 rounded-full"
          >
            <PiX className="w-6 h-6" />
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
                <span className="text-[9px] opacity-40 mt-1 block w-full text-right font-mono tracking-tighter" suppressHydrationWarning>
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
