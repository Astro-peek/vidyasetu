import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, FileSearch, MessageSquare, ScanSearch, Send, Sparkles, X, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { schemes } from '../data/mockData';
import { api } from '../services/api';

const tabs = [
  { id: 'chat', title: 'Chat', icon: MessageSquare },
  { id: 'eligibility', title: 'Eligibility', icon: CheckCircle2 },
  { id: 'scanner', title: 'AI Scanner', icon: ScanSearch },
];

const suggestions = [
  'Am I eligible for NFST?',
  'Documents required for NOS',
  'How to fix a deficiency?',
  'Track my application',
];

export default function AIAssistant() {
  const { role, setRole, studentProfile, assistantOpen, setAssistantOpen, assistantTab, setAssistantTab, openAssistant } = useAppContext();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(studentProfile.category || 'ST');
  const [income, setIncome] = useState(Number(studentProfile.familyIncome) || 450000);
  const [schemeId, setSchemeId] = useState('nfst');
  const [evaluation, setEvaluation] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (assistantOpen) panelRef.current?.querySelector('.vs-ai-close')?.focus();
  }, [assistantOpen]);
  
  useEffect(() => { transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, assistantTab, loading]);
  
  useEffect(() => {
    if (!assistantOpen) return undefined;
    const onKeyDown = event => { if (event.key === 'Escape') { setAssistantOpen(false); launcherRef.current?.focus(); } };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [assistantOpen, setAssistantOpen]);

  const ask = async (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages(current => [...current, { speaker: 'you', body: clean }]);
    setQuestion('');
    setLoading(true);

    try {
      // Connect to Gemini Backend
      const res = await api.chatWithAssistant(clean, role);
      setMessages(current => [...current, { speaker: 'assistant', body: res.reply }]);
    } catch (error) {
      setMessages(current => [...current, { speaker: 'assistant', body: 'Sorry, I am having trouble connecting to the intelligence engine: ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = event => {
    event.preventDefault();
    const scheme = schemes.find(item => item.id === schemeId);
    const incomeRule = scheme.config.rules.find(rule => rule.field === 'familyIncome');
    const overLimit = incomeRule && income > incomeRule.value;
    const mismatch = category !== 'ST';
    setEvaluation({ scheme, overLimit, mismatch, limit: incomeRule?.value });
  };
  
  const checkFile = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const supported = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    setFileName(file.name);
    setScanResult({ pass: supported && file.size <= 5 * 1024 * 1024, body: !supported ? 'This demo accepts PDF, JPG or PNG for the basic file check.' : file.size > 5 * 1024 * 1024 ? 'This file exceeds the 5 MB sample limit. Check the scheme-specific limits before uploading.' : 'File type and size look suitable for the demo check. Text, dates, seals and authenticity have not been verified.' });
    event.target.value = '';
  };
  
  const follow = reply => {
    if (reply.tab) setAssistantTab(reply.tab);
    if (reply.href) {
      if (reply.href.startsWith('/schemes') || reply.href.startsWith('/applications') || reply.href === '/apply') setRole('applicant');
      navigate(reply.href);
      setAssistantOpen(false);
    }
  };

  return <div className="vs-ai-root">
    {!assistantOpen && <button ref={launcherRef} className="vs-ai-launcher" onClick={() => openAssistant('chat')} aria-label="Open SetuAI assistant, chat, eligibility and scanner"><Sparkles size={21}/><span><strong>Ask SetuAI</strong><small>Chat · Check · Scan</small></span></button>}
    {assistantOpen && <section ref={panelRef} className="vs-ai-panel" aria-label="SetuAI assistant">
      <header className="vs-ai-header"><span className="vs-ai-logo"><Sparkles size={23}/></span><div><div className="vs-ai-heading"><strong>SetuAI Assistant</strong><span>LIVE AI</span></div><small>MoTA Scholarship Intelligence Engine</small></div><button className="vs-ai-close" onClick={() => {setAssistantOpen(false);launcherRef.current?.focus();}} aria-label="Close assistant"><X size={21}/></button></header>
      <nav className="vs-ai-tabs" aria-label="Assistant tools">{tabs.map(({ id, title, icon: Icon }) => <button key={id} type="button" className={assistantTab === id ? 'active' : ''} aria-current={assistantTab === id ? 'page' : undefined} onClick={() => setAssistantTab(id)}><Icon size={18}/><span>{title}</span></button>)}</nav>
      {assistantTab === 'chat' && <><div className="vs-ai-chat-body" ref={transcriptRef} role="log" aria-live="polite">
        <div className="vs-ai-message assistant">Namaste! I am SetuAI, powered by Gemini AI. Ask me anything about MoTA scholarships, guidelines, or scheme rules.</div>
        {location.pathname !== '/' && <p className="vs-ai-context">Need help on this page? Ask below, or switch to a tool above.</p>}
        {messages.map((message, index) => <div key={index} className={`vs-ai-message ${message.speaker}`}>{message.body}</div>)}
        {loading && <div className="vs-ai-message assistant opacity-50 flex items-center gap-2 font-medium bg-transparent pt-0"><Activity className="animate-spin w-4 h-4 text-teal-600" /> Thinking...</div>}
      </div><div className="vs-ai-chat-footer"><div className="vs-ai-suggestions">{suggestions.map(item => <button key={item} onClick={() => ask(item)}>{item}</button>)}</div><form onSubmit={event => { event.preventDefault(); ask(question); }}><label className="sr-only" htmlFor="setu-ai-question">Ask a question</label><input id="setu-ai-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about schemes, documents, or rules…"/><button type="submit" disabled={!question.trim() || loading} aria-label="Send question"><Send size={19}/></button></form></div></>}
      {assistantTab === 'eligibility' && <div className="vs-ai-tool-body"><div className="vs-ai-intro"><Sparkles size={21}/><strong>Instant Scheme Evaluator</strong><p>Adjust your details to test the sample rules for MoTA scholarships.</p></div><form className="vs-ai-evaluator" onSubmit={checkEligibility}>
        <label>Category<select value={category} onChange={event => {setCategory(event.target.value);setEvaluation(null);}}><option value="ST">Scheduled Tribe (ST)</option><option value="other">Other category</option></select></label>
        <label>Annual family income <strong>₹{income.toLocaleString('en-IN')}</strong><input type="range" min="100000" max="1200000" step="10000" value={income} onChange={event => {setIncome(Number(event.target.value));setEvaluation(null);}}/><span className="vs-ai-range-labels"><small>₹1.0L</small><small>₹6.0L</small><small>₹8.0L</small><small>₹12.0L</small></span></label>
        <label>Course / scheme<select value={schemeId} onChange={event => {setSchemeId(event.target.value);setEvaluation(null);}}><option value="nfst">Ph.D / Research in India (NFST)</option><option value="nos">Masters / Ph.D abroad (NOS)</option><option value="tce">UG / PG at eligible institute (Top Class)</option></select></label>
        <button className="vs-ai-primary" type="submit"><CheckCircle2 size={18}/> Evaluate my eligibility</button>
      </form>{evaluation && <div className={`vs-ai-result ${evaluation.mismatch || evaluation.overLimit ? 'attention' : ''}`} role="status"><strong>{evaluation.mismatch || evaluation.overLimit ? 'One or more demo rules need attention' : 'Preliminary match on the checked demo rules'}</strong><p>{evaluation.mismatch ? 'The sample category rule requires ST. ' : 'ST category matches the sample rule. '}{evaluation.limit ? evaluation.overLimit ? `The sample income limit for ${evaluation.scheme.shortName} is ₹${evaluation.limit.toLocaleString('en-IN')}.` : `Income is within the sample ₹${evaluation.limit.toLocaleString('en-IN')} limit.` : 'The sample catalog does not specify an income limit for this scheme.'} Academic and other conditions still require review.</p><button onClick={() => follow({href:`/schemes/${evaluation.scheme.id}`})}>View scheme details <ChevronRight size={15}/></button></div>}</div>}
      {assistantTab === 'scanner' && <div className="vs-ai-tool-body"><div className="vs-ai-intro purple"><FileSearch size={21}/><strong>AI Document Pre-Screening</strong><p>Try sample certificates or check a local file's type and size before applying.</p></div><h3 className="vs-ai-section-title">Choose a sample certificate to test</h3><div className="vs-ai-samples"><button onClick={() => {setFileName('Sample clear income certificate');setScanResult({pass:true,body:'Sample pass: the example includes a readable date and Tehsildar stamp. Human verification is still required.'});}}><span><strong>Sample Clear Income Certificate</strong><small>Includes Tehsildar stamp &amp; clear date</small></span><em className="pass">Test Pass</em></button><button onClick={() => {setFileName('Sample blurry / cropped certificate');setScanResult({pass:false,body:'Sample deficiency: the example date is cropped and the seal is unreadable. Request a clearer copy before review.'});}}><span><strong>Sample Blurry / Cropped Certificate</strong><small>Simulates cropped date and unreadable seal</small></span><em className="flag">Test Deficiency</em></button></div><label className="vs-ai-file-check"><ScanSearch size={17}/> Check a local file (PDF, JPG, PNG · 5 MB max)<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={checkFile}/></label>{scanResult && <div role="status" className={`vs-ai-result ${scanResult.pass ? '' : 'attention'}`}><strong>{scanResult.pass ? 'Sample check passed' : 'Needs attention'} · {fileName}</strong><p>{scanResult.body}</p></div>}</div>}
      <p className="vs-ai-disclaimer" id="vs-ai-demo-note">Powered by Gemini AI · Always verify official notifications.</p>
    </section>}
  </div>;
}
