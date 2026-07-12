import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, User, AlertCircle, Bot } from 'lucide-react';

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      message: `Hello ${user?.name || 'Student'}! I am **EduBot**, your portal helper. I can give you quick responses about your real-time academic standing. Try asking me about: \n\n` +
               `• *"My attendance status?"*\n` +
               `• *"Pending assignments"* \n` +
               `• *"Do I have any fee dues?"*\n` +
               `• *"Show my class timetable"* \n` +
               `• *"When are my semester exams?"*\n` +
               `• *"Show placement drives"*`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  const quickReplies = [
    'When are my exams?',
    'My attendance status?',
    'Pending assignments',
    'Placement drives',
    'View timetable',
    'Fee status'
  ];

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setErrorMsg('');

    // Append user message
    const userMsg = { sender: 'user', message: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSubmitting(true);

    try {
      // POST request to backend chat endpoint
      const res = await api.post('/ai-assistant/chat', { message: text });
      
      const botMsg = {
        sender: 'bot',
        message: res.data.message,
        timestamp: new Date(res.data.timestamp)
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('AIChat communication error:', err);
      // User visible fallback banner message
      setErrorMsg('Connection error. Failed to reach EduBot API. Check if server is running.');
      
      // Append fallback bot reply
      const fallbackMsg = {
        sender: 'bot',
        message: '⚠️ **EduBot Offline:** I could not communicate with the database servers. Please verify that the backend node service is running and CORS allows requests.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Convert markdown-style bullet points/bold text to basic HTML for a neat UI
  const formatText = (text) => {
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Handle bold texts e.g. **text**
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');
      // Handle bullet items e.g. • item
      if (line.trim().startsWith('•')) {
        return (
          <p key={idx} className="pl-4 py-0.5 relative text-xs text-slate-350 leading-relaxed">
            <span className="absolute left-0 text-brand-blue font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.replace('•', '').trim() }} />
          </p>
        );
      }
      return <p key={idx} className="min-h-[1rem] leading-relaxed text-xs text-slate-200" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col h-[75vh] max-h-[600px] overflow-hidden">
      {/* Bot Chat Header Info */}
      <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center bg-slate-50 dark:bg-navy-900/50 select-none">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-blue flex items-center justify-center text-white relative animate-pulse-subtle">
            <Bot className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-brand-green border-2 border-white dark:border-navy-900"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading tracking-wider">EduBot Assistant</h3>
            <span className="text-[10px] text-brand-blue font-bold">Online — Powered by Claude LLM Schema</span>
          </div>
        </div>
      </div>

      {/* Connection warning alert banner */}
      {errorMsg && (
        <div className="p-3 bg-brand-red/10 border-b border-brand-red/20 text-brand-red text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Messages bubble body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-navy-950/20">
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={index} className={`flex items-start gap-2.5 ${!isBot ? 'flex-row-reverse' : ''}`}>
              {/* Avatar circle */}
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                isBot ? 'bg-brand-blue text-white' : 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message Bubble box */}
              <div className={`p-4 rounded-2xl max-w-sm sm:max-w-md text-xs font-medium space-y-1 shadow-sm leading-relaxed ${
                isBot
                  ? 'bg-white dark:bg-navy-900 border border-slate-200/50 dark:border-navy-700/50 text-slate-800 dark:text-slate-250 rounded-tl-none'
                  : 'bg-brand-blue text-white rounded-tr-none'
              }`}>
                {isBot ? formatText(msg.message) : <p className="text-slate-100">{msg.message}</p>}
                <span className={`text-[8px] font-mono font-bold block text-right select-none ${isBot ? 'text-slate-400' : 'text-slate-200'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {submitting && (
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 bg-white dark:bg-navy-900 border border-slate-200/50 dark:border-navy-700/50 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
              <div className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce"></div>
              <div className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-5 py-3 border-t border-slate-150 dark:border-navy-700/50 select-none overflow-x-auto flex gap-1.5 whitespace-nowrap bg-slate-50/20 dark:bg-navy-900/10">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => handleSendMessage(reply)}
            disabled={submitting}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 dark:bg-navy-700 dark:hover:bg-navy-600 text-[10.5px] font-bold font-heading text-slate-500 dark:text-slate-350 rounded-full transition-colors border border-slate-200 dark:border-navy-600"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message input footer form */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-150 dark:border-navy-700 bg-white dark:bg-navy-850 flex gap-3 select-none">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask EduBot a question about your attendance, fees, etc..."
          className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 outline-none focus:border-brand-blue dark:focus:border-brand-blue text-slate-800 dark:text-white transition-colors"
          disabled={submitting}
          required
        />
        <button
          type="submit"
          disabled={submitting || !inputText.trim()}
          className="h-9 w-9 bg-brand-blue hover:bg-brand-blue/90 disabled:bg-slate-200 dark:disabled:bg-navy-750 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-blue/20 transition-all hover:translate-y-[-0.5px]"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
};

export default AIChat;
