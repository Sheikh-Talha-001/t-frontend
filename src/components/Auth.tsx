import React, { useState } from 'react';
import { Mail, Lock, User, Github, Chrome, Apple, ChevronRight, Leaf, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import api from '../lib/api';

export const Auth: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
        onLogin();
      } else {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
        onLogin();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error && 'response' in err ? (err as any).response?.data?.message : 'Authentication failed. Please try again.';
      toast.error(errorMsg || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#f8fafc]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-md px-6">
        <div className="text-center mb-8 mt-6">
            <div className="w-14 h-14 bg-[#006644] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/10">
                <Leaf size={32} className="text-emerald-50 fill-emerald-50/20" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Donezo</h1>
        </div>

        <motion.div 
            layout
            className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-200"
        >
            <AnimatePresence mode="wait">
                {isLogin ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-2">
                            <h2 className="text-xl font-semibold text-slate-900">Welcome Back</h2>
                            <p className="text-slate-500 text-sm mt-1">Please enter your details to sign in</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password" 
                                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006644]/5 focus:border-[#006644] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded-full border-slate-200 text-[#006644] focus:ring-[#006644]" />
                                <span className="text-xs text-slate-500 group-hover:text-slate-900 transition-colors">Remember me</span>
                            </label>
                            <button className="text-xs font-semibold text-[#006644] hover:underline">Forgot password?</button>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-[#006644] hover:bg-[#005236] disabled:opacity-70 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-white px-4 text-slate-400 font-bold">OR</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl text-sm font-medium hover:bg-slate-50 transition-all">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
                                Continue with Google
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-500">
                            Don't have an account? <button onClick={() => setIsLogin(false)} className="text-[#064e3b] font-bold hover:underline">Sign Up</button>
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                            <p className="text-slate-500 text-sm mt-1">Start your management journey today.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jane Doe" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]/5 focus:border-[#064e3b] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@example.com" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]/5 focus:border-[#064e3b] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]/5 focus:border-[#064e3b] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-[#064e3b] hover:bg-[#053d2e] disabled:opacity-70 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? 'Signing Up...' : 'Sign Up'}
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative py-2">
                             <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-white px-4 text-slate-400 font-bold">OR</span>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl text-sm font-medium hover:bg-slate-50 transition-all">
                             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 shrink-0" alt="" />
                             <span className="flex-1 text-center pr-5">Continue with Google</span>
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-2">
                            Already have an account? <button onClick={() => setIsLogin(true)} className="text-[#064e3b] font-bold hover:underline">Sign In</button>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        <div className="mt-12 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Nexus Core Online
        </div>
      </div>
    </div>
  );
};
