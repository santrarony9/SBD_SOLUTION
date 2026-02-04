"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessageToBot, ChatMessage } from "@/lib/chatService";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "bot", content: "Welcome to Spark Blue Diamond. How may I assist you with your jewellery selection today?" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const botResponse = await sendMessageToBot(userMessage);
            setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "I apologize, but I am unable to connect at the moment. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    // Chat Bubble Component
    const ChatBubble = ({ message }: { message: ChatMessage }) => {
        const isBot = message.role === "bot";
        return (
            <div className={`flex w-full ${isBot ? "justify-start" : "justify-end"} mb-4`}>
                <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm relative ${isBot
                            ? "bg-[#FAFAF9] text-[#0F172A] border border-[#C6A87C]/20 rounded-tl-sm"
                            : "bg-[#0F172A] text-[#F0E6D2] rounded-tr-sm border border-[#0F172A]"
                        }`}
                >
                    {message.content}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none font-sans">
            {/* Chat Window */}
            <div
                className={`pointer-events-auto transition-all duration-300 ease-in-out transform origin-bottom-right mb-6 w-[22rem] sm:w-[26rem] 
        bg-white/90 backdrop-blur-xl border border-[#C6A87C]/30 shadow-2xl rounded-xl overflow-hidden flex flex-col
        ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none h-0"}`}
                style={{ maxHeight: "650px", height: "550px" }}
            >
                {/* Header */}
                <div className="bg-[#0F172A] p-5 flex justify-between items-center shadow-lg relative overflow-hidden">
                    {/* Decorative shine */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A87C] opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>

                    <div className="flex items-center gap-3 z-10">
                        <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center border border-[#C6A87C]/50 shadow-inner">
                            <IoSparkles className="text-[#C6A87C] animate-pulse" size={18} />
                        </div>
                        <div>
                            <h3 className="text-[#F0E6D2] font-serif font-medium tracking-wide text-lg">Concierge</h3>
                            <p className="text-[#94a3b8] text-xs uppercase tracking-wider">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="text-[#C6A87C]/80 hover:text-[#F0E6D2] transition-colors z-10"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAF9] scrollbar-thin scrollbar-thumb-[#C6A87C]/20 hover:scrollbar-thumb-[#C6A87C]/40">
                    <div className="flex justify-center mb-6">
                        <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest border-b border-[#e2e8f0] pb-1">Today</span>
                    </div>
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex w-full justify-start mb-4">
                            <div className="bg-[#FAFAF9] rounded-2xl px-5 py-4 border border-[#C6A87C]/20 rounded-tl-sm shadow-sm">
                                <div className="flex space-x-1.5 h-2 items-center">
                                    <div className="w-1.5 h-1.5 bg-[#C6A87C] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#C6A87C] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#C6A87C] rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-2 bg-[#f8fafc] rounded-full px-5 py-3 border border-[#e2e8f0] focus-within:border-[#C6A87C]/50 focus-within:shadow-[0_0_0_1px_rgba(198,168,124,0.1)] transition-all duration-300">
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-[#334155] placeholder-[#94a3b8] font-light"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-2 rounded-full transition-all duration-300 ${input.trim()
                                    ? "text-[#0F172A] bg-[#C6A87C] hover:bg-[#d4b991] shadow-md transform hover:-translate-y-0.5"
                                    : "text-gray-300 cursor-not-allowed"
                                }`}
                        >
                            <FaPaperPlane size={14} className={input.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-[#cbd5e1]">Powered by <span className="text-[#C6A87C]">SBD AI</span></p>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 group relative overflow-hidden ring-4 ring-white/30 ${isOpen ? "bg-[#f1f5f9] text-[#64748b] rotate-90 scale-0 opacity-0 absolute" : "bg-[#0F172A] text-[#C6A87C] opacity-100 scale-100"
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C6A87C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <IoSparkles size={28} className="animate-pulse" />
            </button>

            {/* Close Button Placeholder (Swap effect) */}
            <button
                onClick={toggleChat}
                className={`pointer-events-auto w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-[#ef4444] text-white transform hover:scale-105 active:scale-95 ring-4 ring-white/30 ${isOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90 absolute"
                    }`}
            >
                <FaTimes size={24} />
            </button>

        </div>
    );
}
