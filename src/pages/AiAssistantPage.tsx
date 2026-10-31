import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  actionCard?: {
    title: string;
    detail: string;
    status: string;
  };
}

export const AiAssistantPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your CIT CampusSync AI Assistant. You can ask me to search room availability, check faculty schedules, or query exam and venue bookings in plain English.',
    },
    {
      sender: 'user',
      text: 'Find a free lecture hall with at least 100 capacity for CSE department tomorrow at 11:30 AM.',
    },
    {
      sender: 'ai',
      text: 'I found 2 available lecture halls in CIT Block B matching your criteria without conflicting sessions:',
      actionCard: {
        title: 'Block B - CR-204 (Smart Lecture Theatre)',
        detail: 'Capacity: 120 seats • Smart Board, Projector & AC Ready • Free 11:00 AM - 01:30 PM',
        status: 'Instantly Bookable',
      },
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // Simulated AI response
    setTimeout(() => {
      let aiReply = "I have processed your campus query through the CIT active timetable engine.";
      let card = undefined;

      if (userText.toLowerCase().includes('auditorium') || userText.toLowerCase().includes('sac') || userText.toLowerCase().includes('venue')) {
        aiReply = "CIT Main Auditorium is currently open for booking on Friday afternoon with all AV equipment operational.";
        card = {
          title: 'Main Auditorium (Central Wing)',
          detail: 'Capacity: 600 seats • Stage Lighting, Surround JBL Audio • Available Friday 2:00 PM onwards',
          status: 'Open for Requisition',
        };
      } else if (userText.toLowerCase().includes('prof') || userText.toLowerCase().includes('faculty') || userText.toLowerCase().includes('sharma')) {
        aiReply = "Dr. Manoranjan Sharma is currently in Advanced AI Lab C taking CS303P until 12:45 PM. Next free office hour is 3:30 PM.";
      } else {
        aiReply = `Verified query "${userText}". No scheduling clashes detected across CIT Academic Block A and B.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          actionCard: card,
        },
      ]);
    }, 700);
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item h-[calc(100vh-140px)] flex flex-col">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">CampusSync AI Assistant</h2>
            <p className="text-xs text-slate-300">Natural language smart scheduling, room queries, and timetable assistance</p>
          </div>
        </div>
      </div>

      {/* Chat Area Card */}
      <div className="liquid-glass-card rounded-2xl flex-1 flex flex-col overflow-hidden p-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-white/10 border border-white/20 text-slate-100 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.actionCard && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-xs">{msg.actionCard.title}</p>
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        {msg.actionCard.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{msg.actionCard.detail}</p>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your natural language scheduling question (e.g. 'Is CR-101 free at 3 PM?')..."
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white text-xs outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
