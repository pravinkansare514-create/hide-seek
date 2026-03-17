import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Search, Ghost, Send, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
import { getGameResponse, Message, GameRole } from './services/geminiService';

export default function App() {
  const [gameRole, setGameRole] = useState<GameRole>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startGame = async (role: GameRole) => {
    setGameRole(role);
    setIsLoading(true);
    
    const initialPrompt = role === 'seeker' 
      ? "I'm counting to 100! You hide first. Describe the room and the three objects you might be behind."
      : "I'll hide first! I'm in a dusty attic... (Wait, no, I'm in the Labyrinth). Start the game by describing your hiding spot.";

    const firstMessage: Message = { 
      role: 'user', 
      text: role === 'seeker' ? "You hide first. I'm counting to 100!" : "I'll hide first! I'm in a dusty attic..." 
    };

    try {
      const response = await getGameResponse([firstMessage], role);
      setMessages([
        firstMessage,
        { role: 'model', text: response || "The shadows shift, but no words come..." }
      ]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'system', text: "The magic flickers... (Error connecting to the Labyrinth)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGameResponse([...messages, userMsg], gameRole);
      setMessages(prev => [...prev, { role: 'model', text: response || "..." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', text: "The echoes fade... (Connection lost)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setGameRole(null);
    setMessages([]);
    setInput('');
  };

  if (!gameRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="atmosphere" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full glass-panel p-8 text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block p-4 rounded-full bg-amber-500/10 mb-2"
            >
              <Book className="w-12 h-12 text-amber-500" />
            </motion.div>
            <h1 className="text-5xl font-bold serif glow-text text-amber-500">Labyrinth of Echoes</h1>
            <p className="text-lg text-stone-400 max-w-md mx-auto italic">
              "A shifting, magical library where shadows whisper and books breathe. Will you hide among the echoes, or seek the truth?"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => startGame('seeker')}
              className="group relative p-6 glass-panel hover:border-amber-500/50 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
                <Search className="w-5 h-5" /> I'll Seek
              </h3>
              <p className="text-sm text-stone-400">You count to 100 while the AI vanishes into the library's depths.</p>
            </button>

            <button
              onClick={() => startGame('hider')}
              className="group relative p-6 glass-panel hover:border-amber-500/50 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ghost className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
                <Ghost className="w-5 h-5" /> I'll Hide
              </h3>
              <p className="text-sm text-stone-400">Describe your hiding spot and watch the AI hunt you down.</p>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      <div className="atmosphere" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 glass-panel px-6 py-4">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-bold serif text-amber-500 hidden md:block">Labyrinth of Echoes</h2>
          <div className="px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold uppercase tracking-widest text-amber-500 border border-amber-500/20">
            {gameRole === 'seeker' ? 'Seeking' : 'Hiding'}
          </div>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-stone-400 hover:text-amber-500"
          title="Reset Game"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel mb-6 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-50' 
                    : msg.role === 'system'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 italic text-center w-full'
                    : 'bg-white/5 border border-white/10 text-stone-200'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-stone-400 text-sm italic">The echoes are shifting...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={gameRole === 'seeker' ? "Ask a question or guess a spot..." : "Describe your movements..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors text-stone-200"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-900/20"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-stone-500 text-xs flex items-center justify-center gap-4">
        <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Use sensory details</span>
        <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Ask about the environment</span>
        <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Be evocative</span>
      </div>
    </div>
  );
}
