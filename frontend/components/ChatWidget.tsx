"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessageToBot, ChatMessage } from "@/lib/chatService";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "bot", content: "Hello! How can I help you today?" },
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
                { role: "bot", content: "Sorry, something went wrong. Please try again." },
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isBot
                            ? "bg-white/90 text-gray-800 border border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                            : "bg-blue-600 text-white"
                        }`}
                >
                    {message.content}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div
                className={`pointer-events-auto transition-all duration-300 ease-in-out transform origin-bottom-right mb-4 w-80 sm:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none h-0"
                    }`}
                style={{ maxHeight: "600px", height: "500px" }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <h3 className="text-white font-semibold tracking-wide">AI Assistant</h3>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-black/20 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex w-full justify-start mb-4">
                            <div className="bg-white/90 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700 max-w-[80%]">
                                <div className="flex space-x-1 h-4 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 transition-colors">
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-2 rounded-full transition-all ${input.trim()
                                    ? "text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <FaPaperPlane size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? "bg-gray-200 text-gray-600 rotate-90 scale-0 opacity-0 absolute" : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white opacity-100 scale-100"
                    }`}
            >
                <FaComments size={24} />
            </button>

            {/* Close Button Placeholder to maintain clicking space when open if needed, 
          but utilizing the absolute positioning above for a clean swap effect */}
            <button
                onClick={toggleChat}
                className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-red-500 text-white transform hover:scale-110 active:scale-95 ${isOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90 absolute"
                    }`}
            >
                <FaTimes size={24} />
            </button>

        </div>
    );
}
