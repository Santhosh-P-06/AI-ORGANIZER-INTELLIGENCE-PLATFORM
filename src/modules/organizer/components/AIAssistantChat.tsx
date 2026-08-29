import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { EventItem } from '../../../types';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Loader2,
  X,
  MessageSquare,
  ChevronDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface AIAssistantChatProps {
  event: EventItem;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ event }) => {
  const { registrations, certificates } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Event Intelligence Copilot for **${event.title}**. You can ask me real-time queries about participant attendance, jury panel assignments, volunteer schedules, or certificate distribution.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const presentCount = eventRegs.filter((r) => r.attendance?.attended).length;

  const quickChips = [
    'What is our current attendance turnout?',
    'Which teams are assigned to Room 101?',
    'How many certificates are pending dispatch?',
    'Draft an announcement for the final round',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          eventContext: {
            title: event.title,
            type: event.type,
            venue: event.venue,
            date: event.date,
            maxStudents: event.maxStudents,
            totalRegistered: eventRegs.length,
            presentCount,
            panels: event.panels,
            allocationsCount: event.allocations?.length || 0,
            volunteersCount: event.volunteerAssignments?.length || 0,
            certificatesCount: certificates.filter((c) => c.eventId === event.id).length,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I have analyzed the current event status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary issue retrieving live metrics. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100">AI Event Assistant Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">Connected to Live Event Intelligence Engine</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>AI Copilot is analyzing event telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] whitespace-nowrap border border-slate-800 transition-colors flex-shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about attendees, panels, volunteers, or certificates..."
          className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
