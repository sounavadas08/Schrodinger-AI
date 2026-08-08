import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, ChevronDown, Send, Sparkles, X, RefreshCw, Bot, User } from "lucide-react";
import { ChatMessage } from "../types";

export const AuraChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I'm Aura, your AI filmmaking co-pilot. Ask me anything about character arcs, scene blocking, shot lists, or exporting screenplays.",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/aura-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I had trouble connecting to the AI Studio core. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-5 py-3 rounded-full bg-[#12121A] border border-white/15 shadow-2xl shadow-black hover:border-[#5eead4]/50 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-[#5eead4]/15 border border-[#5eead4]/30 flex items-center justify-center text-[#5eead4]">
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left font-mono">
              <span className="text-xs font-bold text-white block">Aura Chat</span>
              <span className="text-[10px] text-[#5eead4] block">schrodinger Ai Intelligence</span>
            </div>
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5eead4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5eead4]" />
            </span>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="chat-expanded"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[360px] sm:w-[400px] h-[500px] bg-[#0E0E13] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-[#131318] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5eead4]/15 border border-[#5eead4]/30 flex items-center justify-center text-[#5eead4]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sora text-sm font-semibold text-white">Aura Chat</h4>
                  <p className="font-mono text-[10px] text-[#9A9AA5]">schrodinger Ai Intelligence</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                aria-label="Close Aura Chat"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs sm:text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                      m.role === "user"
                        ? "bg-[#c084fc]/20 border border-[#c084fc]/40 text-[#c084fc]"
                        : "bg-[#5eead4]/20 border border-[#5eead4]/40 text-[#5eead4]"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#2a292f] text-white rounded-tr-none border border-white/10"
                        : "bg-[#1b1b20] text-gray-200 rounded-tl-none border border-white/10"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#5eead4] font-mono p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Aura is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="px-3 py-2 bg-[#0A0A0F] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
              {["Give me a plot twist", "Camera specs for noir", "Pacing tip"].map((tip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(tip)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#9A9AA5] hover:text-white whitespace-nowrap transition-colors"
                >
                  {tip}
                </button>
              ))}
            </div>

            {/* Input & Send Action */}
            <div className="p-3 bg-[#131318] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Chat interface here..."
                  className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2.5 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-xs flex items-center gap-1 hover:bg-[#b5fff0] transition-colors disabled:opacity-40"
                >
                  <span>Start Conversation</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
