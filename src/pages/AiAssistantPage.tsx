import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, AlertCircle, Trash2, Cpu } from 'lucide-react';

interface ActionCard {
  title: string;
  detail: string;
  status: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionCard?: ActionCard;
  timestamp: string;
  isError?: boolean;
}

export const AiAssistantPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    model: string;
    provider: string;
  }>({
    online: false,
    model: 'Gemini 3.8 Flash',
    provider: 'Google Gemini',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Hello! I am your CIT CampusSync AI Assistant powered by Google Gemini. You can ask me to search room availability, check faculty schedules, verify booking rejection reasons, or navigate timetable disruptions in natural language.',
      timestamp: 'Just now',
    },
    {
      id: 'init-2',
      sender: 'user',
      text: 'Find a free lecture hall with at least 100 capacity for CSE department tomorrow at 11:30 AM.',
      timestamp: 'Just now',
    },
    {
      id: 'init-3',
      sender: 'ai',
      text: 'I found 2 available lecture halls in CIT Block B matching your criteria without conflicting sessions:',
      actionCard: {
        title: 'Block B - CR-204 (Smart Lecture Theatre)',
        detail: 'Capacity: 120 seats • Smart Board, Projector & AC Ready • Free 11:00 AM - 01:30 PM',
        status: 'Instantly Bookable',
      },
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus({
            online: data.status === 'online',
            model: data.model || 'Gemini 3.8 Flash',
            provider: data.provider || 'Google Gemini',
          });
        }
      } catch {
        setBackendStatus((prev) => ({ ...prev, online: false }));
      }
    };
    checkHealth();
  }, []);

  const executeSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setApiError(null);
    setLastUserPrompt(userText);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend LLM
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          userRole: localStorage.getItem('cit_role') || 'club_rep',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || `Server responded with status ${res.status}`);
      }

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.reply || 'Query processed.',
        actionCard: data.actionCard,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setBackendStatus((prev) => ({ ...prev, online: true, model: data.model || prev.model }));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to connect to CampusSync AI engine. Please verify the backend is running.';
      setApiError(errorMessage);

      // Add friendly error bubble in chat
      const errorBubble: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'ai',
        text: `⚠️ **API Error:** ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorBubble]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(input);
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      executeSend(lastUserPrompt);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-fresh',
        sender: 'ai',
        text: 'Conversation cleared. How can I assist you with CIT campus scheduling, room booking, or timetable queries?',
        timestamp: 'Just now',
      },
    ]);
    setApiError(null);
  };

  const quickPrompts = [
    'Check Main Auditorium availability & audio setup for Friday',
    'Why was the Robotics Club SAC booking rejected?',
    'Where is Dr. Manoranjan Sharma and what are his office hours?',
    'What is the proposed resolution for CS303P lab disruption?',
    'Is CR-204 available for booking on Tuesday afternoon?',
  ];

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item h-[calc(100vh-140px)] flex flex-col">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">CampusSync AI Assistant</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{backendStatus.provider} • {backendStatus.model}</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Natural language smart scheduling, room queries, and institutional timetable assistance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-cyan-300 shrink-0 flex items-center gap-1 pl-1">
          <Cpu className="w-3 h-3" /> Quick queries:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => executeSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1 rounded-xl bg-slate-900/60 hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 text-xs whitespace-nowrap transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Area Card */}
      <div className="liquid-glass-card rounded-2xl flex-1 flex flex-col overflow-hidden p-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                    msg.isError
                      ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                      : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                      : msg.isError
                      ? 'bg-rose-950/40 border border-rose-400/40 text-rose-200 rounded-tl-none backdrop-blur-md'
                      : 'bg-slate-900/60 border border-cyan-500/20 text-slate-100 rounded-tl-none backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.actionCard && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-400/40 space-y-1.5 text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-xs">{msg.actionCard.title}</p>
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40">
                        {msg.actionCard.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{msg.actionCard.detail}</p>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 text-cyan-200 text-xs rounded-tl-none backdrop-blur-md flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Generating response from Google Gemini with CIT active knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner with Retry */}
        {apiError && (
          <div className="mb-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{apiError}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything (e.g. 'Is Main Auditorium free on Friday?', 'Why was REQ-879 rejected?')..."
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white text-xs outline-none placeholder:text-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
