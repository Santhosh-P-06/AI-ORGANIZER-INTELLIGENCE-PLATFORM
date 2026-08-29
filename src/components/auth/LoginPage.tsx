import React, { useState } from 'react';
import { ArrowRight, CalendarDays, LockKeyhole, Mail, Sparkles, UserPlus, UserRound } from 'lucide-react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, registerUser } = useApp();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [message, setMessage] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (isCreatingAccount) {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match. Please re-enter your password.');
        return;
      }
      const result = registerUser({ name, email, password, role });
      if (result.success) onSuccess();
      else setMessage(result.message);
      return;
    }
    if (login(email, role, password)) onSuccess();
    else setMessage('Incorrect email, password, or selected role.');
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),transparent_42%)] pointer-events-none" />
      <section className="relative w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-indigo-950/50 p-7 sm:p-9">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30"><Sparkles className="w-6 h-6" /></div>
          <div><h1 className="font-display text-xl font-bold">AI Event Organiser</h1><p className="text-xs text-slate-400">Intelligent Collegiate Event Platform</p></div>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{isCreatingAccount ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-1 text-sm text-slate-400">{isCreatingAccount ? 'Register to access your event workspace.' : 'Sign in to continue to your dashboard.'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {isCreatingAccount && <label className="block text-xs font-medium text-slate-300">Full name<div className="relative mt-1.5"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" /></div></label>}
          <label className="block text-xs font-medium text-slate-300">Email address<div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@college.edu" className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" /></div></label>
          <label className="block text-xs font-medium text-slate-300">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" /></div></label>
          {isCreatingAccount && <label className="block text-xs font-medium text-slate-300">Re-enter password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input required minLength={6} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" /></div></label>}
          <label className="block text-xs font-medium text-slate-300">Workspace role<select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-700 py-3 px-3 text-sm outline-none focus:border-indigo-500"><option value="STUDENT">Participant</option><option value="ORGANISER">Organiser</option><option value="VOLUNTEER">Volunteer</option><option value="ADMIN">Administrator</option></select></label>
          {message && <p className="text-xs text-rose-400">{message}</p>}
          <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold transition-colors">{isCreatingAccount ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}{isCreatingAccount ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">{isCreatingAccount ? 'Already have an account?' : 'New to the platform?'} <button type="button" onClick={() => { setIsCreatingAccount(!isCreatingAccount); setMessage(''); setConfirmPassword(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">{isCreatingAccount ? 'Sign in' : 'Create account'}</button></p>
        {!isCreatingAccount && <p className="mt-5 text-center text-[11px] text-slate-500">Demo accounts use password <span className="font-mono text-slate-400">password123</span>.</p>}
      </section>
    </main>
  );
};
