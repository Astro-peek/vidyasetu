import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle2, ChevronDown, ClipboardCheck, FileCheck2, FileSearch, GraduationCap, HelpCircle, Menu, Search, Sparkles, UserRound, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';
import { SchemeCard } from '../components/StudentUI';

// PATCHED: role names match backend/AppContext identifiers (not newfrontend short names)
const roles = [
  { title: 'ST student / Applicant', role: 'applicant',         path: '/applicant/dashboard' },
  { title: 'Scheme admin',           role: 'scheme_admin',      path: '/admin/dashboard' },
  { title: 'Scrutiny officer',       role: 'scrutiny_officer',  path: '/scrutiny' },
  { title: 'Committee',              role: 'committee_member',  path: '/committee' },
  { title: 'Ministry viewer',        role: 'ministry_viewer',   path: '/admin/dashboard' },
];
const services = [
  { icon: Search,        number: '01', title: 'Discover scholarships', text: 'Find the right starting point for study in India or abroad.',               action: 'Browse schemes',    path: '/apply' },
  { icon: CheckCircle2, number: '02', title: 'Check eligibility',      text: 'Compare your details with the rules shown in the demo catalog.',            action: 'Try eligibility',   ai: 'eligibility' },
  { icon: FileCheck2,   number: '03', title: 'Prepare documents',      text: 'See checklists and try a basic document pre-screening flow.',               action: 'Check documents',   ai: 'scanner' },
  { icon: ClipboardCheck,number:'04', title: 'Apply with guidance',    text: 'Work through a clear step-by-step application form.',                       action: 'Start applying',    path: '/apply' },
  { icon: Bell,         number: '05', title: 'Track your progress',    text: 'Follow each stage and see what needs your attention.',                       action: 'Track application', path: '/applications' },
  { icon: HelpCircle,   number: '06', title: 'Get answers',            text: 'Ask SetuAI or read practical help for common questions.',                   action: 'Ask SetuAI',        ai: 'chat' },
];
const steps = [
  { number: '01', title: 'Find your fit',          text: 'Explore scholarship options for your course and level of study.' },
  { number: '02', title: 'Get application ready',  text: 'Review sample rules and gather the documents you need.' },
  { number: '03', title: 'Apply and follow up',    text: 'Save your form, submit the demo, and track each update.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { setRole, openAssistant, studentApplications } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [query, setQuery] = useState('');
  // PATCHED: fetch live schemes via real API instead of mockData import
  const [schemes, setSchemes] = useState([]);
  const roleRef = useRef(null);
  const latest = studentApplications[0];

  useEffect(() => {
    let mounted = true;
    api.getSchemes().then(data => {
      if (mounted) setSchemes(data);
    }).catch(err => console.error(err));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!rolesOpen) return undefined;
    const outside = event => { if (!roleRef.current?.contains(event.target)) setRolesOpen(false); };
    const escape = event => { if (event.key === 'Escape') setRolesOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [rolesOpen]);

  const go = (path, role = 'applicant') => { setRole(role); setMobileOpen(false); setRolesOpen(false); navigate(path); };
  const search = event => { event.preventDefault(); go(`/apply${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); };
  const useService = service => { if (service.ai) openAssistant(service.ai); else go(service.path); };

  return <div className="vs-site vs2-home">
    <div className="vs2-utility"><div className="vs2-wrap"><span><span className="vs2-utility-dot"/> A clearer path to scholarships for ST students</span><span className="vs2-utility-right"><span>Frontend prototype</span><ThemeToggle className="vs2-theme"/></span></div></div>
    <header className="vs2-masthead"><div className="vs2-wrap vs2-masthead-inner"><div className="vs2-brand-lockup"><Brand/><span>Explore. Apply. Move forward.</span></div><div className="vs2-masthead-actions"><button onClick={() => openAssistant('eligibility')}><CheckCircle2 size={17}/> Check eligibility</button><button onClick={() => openAssistant('scanner')}><FileSearch size={17}/> Document help</button><div className="vs2-role" ref={roleRef}><button className="vs2-role-trigger" onClick={() => setRolesOpen(value => !value)} aria-expanded={rolesOpen} aria-haspopup="menu"><UserRound size={17}/> Login by role <ChevronDown size={15}/></button>{rolesOpen && <div className="vs2-role-list" role="menu" aria-label="Choose demo role">{roles.map(item => <button role="menuitem" key={item.role} onClick={() => go(item.path,item.role)}>{item.title}<ArrowRight size={15}/></button>)}<small>Role access is for this demo only.</small></div>}</div></div><button className="vs2-mobile-toggle" aria-label={mobileOpen?'Close menu':'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)}>{mobileOpen?<X/>:<Menu/>}</button></div></header>
    <nav className={`vs2-primary-nav ${mobileOpen?'open':''}`} aria-label="Main navigation"><div className="vs2-wrap"><a href="#home" onClick={() => setMobileOpen(false)} className="active">Home</a><button onClick={() => go('/apply')}>Scholarships</button><a href="#services" onClick={() => setMobileOpen(false)}>Services</a><a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a><button onClick={() => go('/applications')}>Track application</button><button onClick={() => openAssistant('chat')}>SetuAI assistant</button><button onClick={() => go('/help')}>Help</button>{mobileOpen && <div className="vs2-mobile-roles"><strong>Demo login</strong>{roles.map(item => <button key={item.role} onClick={() => go(item.path,item.role)}>{item.title}</button>)}</div>}</div></nav>
    <div className="vs2-notice"><div className="vs2-wrap"><span><Bell size={15}/> NOTICE</span><p>This prototype shows illustrative scholarship details and demo application statuses. Always confirm current requirements in the official scheme notification.</p></div></div>
    <main id="home">
      <section className="vs2-hero" aria-labelledby="vs2-title"><img className="vs2-hero-photo" src={`${import.meta.env.BASE_URL}student-library.png`} alt="Student working in a library"/><div className="vs2-hero-shade"/><div className="vs2-wrap vs2-hero-inner"><div className="vs2-hero-content"><span className="vs2-label"><Sparkles size={15}/> A scholarship journey, made simpler</span><h1 id="vs2-title">One bridge between <em>ST students</em> and every MoTA scholarship.</h1><p>A secure, configurable and AI-assisted scholarship management platform. Discover opportunities, prepare your application, and stay informed at every step.</p><form className="vs2-hero-search" onSubmit={search}><Search size={21}/><label className="sr-only" htmlFor="vs2-search">Search schemes</label><input id="vs2-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search NFST, overseas, Top Class…"/><button type="submit">Find scholarships <ArrowRight size={17}/></button></form><div className="vs2-hero-shortcuts"><span>Popular:</span>{schemes.map(item=><button key={item.id} onClick={()=>go(`/schemes/${item.id}`)}>{item.shortName}</button>)}</div><div className="vs2-hero-buttons"><button className="vs2-solid" onClick={()=>go('/applicant/dashboard')}>Go to student dashboard <ArrowRight size={17}/></button><button className="vs2-outline" onClick={()=>openAssistant('chat')}>Ask SetuAI <Sparkles size={16}/></button></div></div><div className="vs2-hero-side"><span className="vs2-hero-side-icon"><GraduationCap size={28}/></span><strong>From questions to next steps</strong><p>One connected space for discovery, documents, applications and updates.</p><div><span>Explore</span><ArrowRight size={14}/><span>Prepare</span><ArrowRight size={14}/><span>Track</span></div></div></div><div className="vs2-hero-bottom"><div className="vs2-wrap"><span>Built around the student journey</span><div><span>01 Discover</span><span>02 Prepare</span><span>03 Apply</span><span>04 Track</span></div></div></div></section>

      <section className="vs2-section vs2-services" id="services"><div className="vs2-wrap"><div className="vs2-section-head"><div><span className="vs2-overline">YOUR SCHOLARSHIP TOOLKIT</span><h2>Everything you need, in one place.</h2><p>Start wherever you are. Each service helps you take one clear next step.</p></div><button className="vs2-link" onClick={()=>go('/apply')}>Browse the catalog <ArrowRight size={17}/></button></div><div className="vs2-services-grid">{services.map(service=><button className="vs2-service" key={service.number} onClick={()=>useService(service)}><span className="vs2-service-top"><span className="vs2-service-icon"><service.icon size={24}/></span><small>{service.number} / 06</small></span><strong>{service.title}</strong><span className="vs2-service-text">{service.text}</span><span className="vs2-service-link">{service.action}<ArrowRight size={16}/></span></button>)}</div></div></section>

      <section className="vs2-spotlight"><div className="vs2-wrap vs2-spotlight-grid"><div className="vs2-spotlight-copy"><span className="vs2-overline">A GUIDE FOR THE MOMENTS THAT MATTER</span><h2>Know what comes next, <em>before you apply.</em></h2><p>Scholarship information can feel scattered. Vidya Setu brings the essentials together so you can find a scheme, review sample eligibility rules and organize your documents with confidence.</p><div className="vs2-check-list"><span><CheckCircle2 size={18}/> Discover schemes for your study path</span><span><CheckCircle2 size={18}/> See document checklists up front</span><span><CheckCircle2 size={18}/> Return to your draft when you're ready</span></div><button className="vs2-dark-button" onClick={()=>go('/apply')}>Explore scholarship options <ArrowRight size={17}/></button></div><div className="vs2-spotlight-art"><span className="vs2-art-overline">YOUR JOURNEY AT A GLANCE</span><div className="vs2-art-card"><span><GraduationCap size={20}/> STUDENT WORKSPACE</span><strong>One place to see your next step.</strong><div className="vs2-art-progress"><span className="done">Discover</span><span className="done">Prepare</span><span>Apply</span><span>Track</span></div><div className="vs2-art-divider"/><div className="vs2-art-row"><span><FileCheck2 size={19}/> Documents checklist</span><CheckCircle2 size={18}/></div><div className="vs2-art-row"><span><Sparkles size={19}/> Eligibility guidance</span><ArrowRight size={18}/></div></div><div className="vs2-art-float"><Sparkles size={20}/><span><strong>SetuAI is here to help</strong><small>Chat · Eligibility · Scanner</small></span></div></div></div></section>

      <section className="vs2-section vs2-schemes" id="schemes"><div className="vs2-wrap"><div className="vs2-section-head"><div><span className="vs2-overline">EXPLORE THE DEMO CATALOG</span><h2>Scholarships worth exploring.</h2><p>Begin with these programmes, then check the latest official notification for final criteria.</p></div><button className="vs2-link" onClick={()=>go('/apply')}>View all schemes <ArrowRight size={17}/></button></div><div className="vs2-scheme-grid">{schemes.map(scheme=><SchemeCard key={scheme.id} scheme={scheme} onView={()=>setRole('applicant')}/>)}</div></div></section>

      <section className="vs2-steps" id="how-it-works"><div className="vs2-wrap"><div className="vs2-section-head"><div><span className="vs2-overline">A CLEAR WAY FORWARD</span><h2>Three steps from search to status.</h2><p>A simple path through a process that often feels complicated.</p></div></div><div className="vs2-step-grid">{steps.map(item=><div className="vs2-step" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>

      <section className="vs2-ai-band"><div className="vs2-wrap vs2-ai-band-inner"><div className="vs2-ai-emblem"><Sparkles size={31}/></div><div><span className="vs2-overline">SETUAI ASSISTANT</span><h2>Need a hand? Just ask.</h2><p>Ask a scheme question, compare sample eligibility rules, or try the document check. The assistant stays with you across the site.</p></div><button onClick={()=>openAssistant('chat')}>Open SetuAI <ArrowRight size={18}/></button></div></section>

      <section className="vs2-section vs2-progress"><div className="vs2-wrap vs2-progress-grid"><div><span className="vs2-overline">STAY IN THE LOOP</span><h2>Your application, step by step.</h2><p>Save a draft, submit an application in the demo and follow its progress in your dashboard. If a document needs attention, see the reason and your next action.</p><button className="vs2-link" onClick={()=>go('/applications')}>View application tracker <ArrowRight size={17}/></button></div><div className="vs2-status-card"><div className="vs2-status-head"><span><ClipboardCheck size={21}/> Application tracker</span><small>{latest?.isExample?'EXAMPLE VIEW':'YOUR SAVED VIEW'}</small></div><strong>{latest?.schemeName || 'Your scholarship application'}</strong><p>{latest ? `${latest.id} · ${latest.status}` : 'No application submitted yet. Explore a scheme to begin.'}</p><div className="vs2-status-steps"><span className="active">Submitted</span><span className={latest?.status && latest.status !== 'Submitted'?'active':''}>Review</span><span className={['Selected','Rejected','Shortlisted'].includes(latest?.status)?'active':''}>Decision</span></div><button onClick={()=>go('/applications')}>Open tracker <ArrowRight size={16}/></button></div></div></section>

      <section className="vs2-cta"><div className="vs2-wrap vs2-cta-inner"><div><span className="vs2-overline">START WITH ONE STEP</span><h2>Your future deserves a clearer route.</h2><p>Find a scholarship, understand the requirements and take the next step with confidence.</p></div><div><button className="vs2-solid" onClick={()=>go('/apply')}>Explore scholarships <ArrowRight size={17}/></button><button className="vs2-outline" onClick={()=>go('/help')}>Visit help centre</button></div></div></section>
    </main>
    <footer className="vs2-footer"><div className="vs2-wrap vs2-footer-main"><div><Brand/><p>A bridge between ST students and scholarship opportunities, from discovery to application tracking.</p></div><div><strong>Explore</strong><button onClick={()=>go('/apply')}>Scholarships</button><button onClick={()=>openAssistant('eligibility')}>Eligibility check</button><button onClick={()=>go('/applications')}>Track application</button></div><div><strong>Support</strong><button onClick={()=>go('/help')}>Help centre</button><button onClick={()=>openAssistant('chat')}>Ask SetuAI</button><a href="#how-it-works">How it works</a></div><div><strong>Demo access</strong>{roles.slice(0,3).map(item=><button key={item.role} onClick={()=>go(item.path,item.role)}>{item.title}</button>)}</div></div><div className="vs2-wrap vs2-footer-bottom"><span>© {new Date().getFullYear()} Vidya Setu · Scholarship frontend prototype</span><span>Illustrative content · Verify official scheme notices</span></div></footer>
  </div>;
}
