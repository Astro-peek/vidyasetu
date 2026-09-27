import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';
import { SchemeCard, ApplicationJourney, JourneyStrip } from '../components/StudentUI';

export default function Home() {
  const navigate = useNavigate();
  const { setRole, studentApplications } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const loginRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api.getSchemes().then(data => {
      if (mounted) setSchemes(data);
    }).catch(err => console.error(err));
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!loginOpen) return undefined;
    const closeOnOutside = event => { if (!loginRef.current?.contains(event.target)) setLoginOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') setLoginOpen(false); };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOnOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [loginOpen]);
  const go = (path, role = 'applicant') => { setRole(role); navigate(path); setMenuOpen(false); };
  const login = (path, selectedRole) => { setLoginOpen(false); go(path, selectedRole); };
  const sample = studentApplications[0];

  return <div className="vs-site">
    <header className="vs-public-header">
      <div className="vs-header-inner">
        <Brand />
        <nav className="vs-public-nav" aria-label="Main navigation">
          <button onClick={() => go('/apply')}>Explore Schemes</button>
          <a href="#how-it-works">How it works</a>
          <button onClick={() => go('/applications')}>Track Application</button>
        </nav>
        <div className="vs-header-actions">
          <ThemeToggle className="vs-header-theme" />
          <div className="vs-role-login" ref={loginRef}><button className="vs-signin" aria-haspopup="menu" aria-expanded={loginOpen} onClick={() => setLoginOpen(value => !value)}>Login by role <ChevronDown size={16}/></button>
            {loginOpen && <div className="vs-role-menu" role="menu" aria-label="Choose demo login role">
              <button role="menuitem" onClick={() => login('/applicant/dashboard','applicant')}>ST student / Applicant</button>
              <button role="menuitem" onClick={() => login('/admin/dashboard','admin')}>Scheme admin</button>
              <button role="menuitem" onClick={() => login('/scrutiny','officer')}>Scrutiny officer</button>
              <button role="menuitem" onClick={() => login('/committee','committee')}>Committee</button>
              <button role="menuitem" onClick={() => login('/admin/dashboard','ministry')}>Ministry viewer</button>
              <small>Choose a role to enter the demo.</small>
            </div>}</div>
          <button className="vs-button vs-button-primary" onClick={() => go('/applicant/dashboard')}>Get started</button>
        </div>
        <button className="vs-mobile-trigger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <nav className="vs-public-mobile-nav" aria-label="Mobile navigation">
        <button onClick={() => go('/apply')}>Explore Schemes</button>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <button onClick={() => go('/applications')}>Track Application</button>
        <span className="vs-mobile-role-heading">Login by role</span>
        <button onClick={() => login('/applicant/dashboard','applicant')}>ST student / Applicant</button>
        <button onClick={() => login('/admin/dashboard','admin')}>Scheme admin</button>
        <button onClick={() => login('/scrutiny','officer')}>Scrutiny officer</button>
        <button onClick={() => login('/committee','committee')}>Committee</button>
        <button onClick={() => login('/admin/dashboard','ministry')}>Ministry viewer</button>
        <button onClick={() => go('/applicant/dashboard')}>Get started</button>
        <ThemeToggle />
      </nav>}
    </header>

    <main>
      <section className="vs-hero">
        <div className="vs-hero-copy">
          <p className="vs-eyebrow">Student scholarship portal</p>
          <h1>One bridge between <em>ST students</em> and every MoTA scholarship</h1>
          <p className="vs-hero-subtitle">A secure, configurable and AI-assisted scholarship management platform.</p>
          <div className="vs-hero-actions">
            <button className="vs-button vs-button-primary" onClick={() => go('/apply')}>Explore scholarships <ArrowRight size={20} /></button>
            <button className="vs-button vs-button-outline" onClick={() => go('/applications')}>Track application</button>
          </div>
        </div>
        <div className="vs-hero-visual" aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}student-library.png`} alt="" />
          <div className="vs-hero-swoop"></div><div className="vs-hero-curve"></div>
        </div>
      </section>

      <div className="vs-home-content">
        <JourneyStrip />
        <div className="vs-home-grid">
          <section className="vs-featured" aria-labelledby="featured-title">
            <div className="vs-section-heading"><div><h2 id="featured-title">Popular schemes</h2><p>Explore scholarship programmes in this demo catalog.</p></div><button className="vs-text-link" onClick={() => go('/apply')}>Explore all schemes <ArrowRight size={17} /></button></div>
            <div className="vs-featured-cards">{schemes.filter(s => s.id === 'nfst' || s.id === 'tce').map(s => <SchemeCard key={s.id} scheme={s} compact onView={()=>setRole('applicant')} />)}</div>
          </section>
          <section className="vs-home-status vs-panel" aria-labelledby="status-title">
            <div className="vs-section-heading"><h2 id="status-title">My application status</h2><button className="vs-text-link" onClick={() => go('/applications')}>View all <ArrowRight size={17} /></button></div>
            {sample ? <div className="vs-status-preview"><strong>{sample.schemeName}</strong><span>Application ID: {sample.id}</span><ApplicationJourney app={sample} compact />{sample.isExample && <small>Example application · Demo data</small>}</div> : <p className="vs-muted">No applications yet. Explore a scheme to get started.</p>}
          </section>
        </div>
      </div>
    </main>
    <footer className="vs-footer"><div><Brand /><p>Helping ST students explore, apply and track in one place.</p><small>Frontend prototype · Scheme details and status are demo data. Check current official guidelines before applying.</small></div></footer>
  </div>;
}
