import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Send, CheckCircle, Mail, User, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface HelpProps {
  onMenuClick: () => void;
}

export const Help: React.FC<HelpProps> = ({ onMenuClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Pre-fill name/email from localStorage user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await api.post('/feedback', { name, email, message });
      setSent(true);
      setMessage('');
      toast.success('Feedback submitted!');
    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast.error('Failed to send feedback');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Help & Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Have a question or suggestion? Let us know.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] p-10 md:p-16 border border-slate-100 dark:border-slate-700 shadow-sm text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Sent Successfully!</h2>
                <p className="text-slate-500 mt-3 leading-relaxed max-w-sm mx-auto">
                  Thank you for your feedback. We have received your message and will contact you soon.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="px-8 py-3.5 bg-[#006644] text-white rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:bg-[#005236] transition-all"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] p-8 md:p-10 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send us a message</h3>
                <p className="text-sm text-slate-400">Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              {/* Name */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white ml-1 flex items-center gap-2">
                  <User size={12} />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white ml-1 flex items-center gap-2">
                  <Mail size={12} />
                  Your Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Message */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white ml-1 flex items-center gap-2">
                  <MessageSquare size={12} />
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, question, or suggestion…"
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 min-h-[160px] resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="w-full bg-[#006644] hover:bg-[#005236] text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                {sending ? 'Sending…' : 'Send Email'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
