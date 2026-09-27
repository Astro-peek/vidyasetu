import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import { supabase, supabaseConfigured } from '../services/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('sign-in');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (!supabaseConfigured) { setNotice('Authentication is not configured. Add the public Supabase variables before deploying.'); return; }
    setBusy(true); setNotice('');
    const result = mode === 'sign-in' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) { setNotice(result.error.message); return; }
    if (mode === 'sign-up' && !result.data.session) { setNotice('Check your email to confirm the account, then sign in.'); return; }
    navigate('/applicant/dashboard', { replace: true });
  };
  return <main className="vs-page vs-empty"><section className="vs-panel" style={{ maxWidth: 460, width: '100%' }}>
    <div className="vs-form-title"><LockKeyhole size={24}/><h1>{mode === 'sign-in' ? 'Sign in' : 'Create an account'}</h1><p>Use your VidyaSetu account to continue.</p></div>
    <form className="vs-profile-form" onSubmit={submit}>
      <div className="vs-field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></div>
      <div className="vs-field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} minLength="8" required /></div>
      {notice && <p className="vs-error" role="alert"><AlertCircle size={16}/>{notice}</p>}
      <button className="vs-button vs-button-primary" disabled={busy} type="submit">{busy ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'} <ArrowRight size={17}/></button>
    </form>
    <p className="vs-muted">{mode === 'sign-in' ? 'New to VidyaSetu?' : 'Already have an account?'} <button className="vs-text-link" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setNotice(''); }}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</button></p>
    <Link className="vs-text-link" to="/">Back to home</Link>
  </section></main>;
}
