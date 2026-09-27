import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ClipboardList, FileSearch, Home, HelpCircle, LayoutDashboard, LogOut, Menu, Settings, UserRound, Users, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';

const applicantNav = [
  { label: 'Dashboard', hi: 'डैशबोर्ड', href: '/applicant/dashboard', icon: Home },
  { label: 'Explore Schemes', hi: 'योजनाएं खोजें', href: '/apply', icon: FileSearch },
  { label: 'My Applications', hi: 'मेरे आवेदन', href: '/applications', icon: ClipboardList },
  { label: 'Help', hi: 'मदद', href: '/help', icon: HelpCircle },
];
const staffNav = {
  admin: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }, { label: 'Schemes', href: '/admin/schemes', icon: ClipboardList }],
  ministry: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  officer: [{ label: 'Scrutiny Queue', href: '/scrutiny', icon: FileSearch }],
  committee: [{ label: 'Selection Workspace', href: '/committee', icon: Users }],
};

export default function Layout() {
  const { role, setRole, lang, setLang, t, studentProfile, studentApplications } = useAppContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isApplicant = role === 'applicant';
  const nav = isApplicant ? applicantNav : (staffNav[role] || []);
  const signOut = () => { setRole(null); setAccountOpen(false); setMenuOpen(false); navigate('/'); };
  const name = studentProfile.fullName?.trim().split(' ')[0] || 'Student';
  const lastApp = studentApplications[0];

  return <div className="vs-app-shell">
    <header className="vs-app-header">
      <Brand />
      {isApplicant && <nav className="vs-app-topnav" aria-label="Student navigation">{applicantNav.map(item => <NavLink key={item.href} to={item.href} className={({ isActive }) => isActive ? 'active' : ''}>{t(item.label,item.hi)}</NavLink>)}</nav>}
      <div className="vs-app-tools">
        <ThemeToggle className="vs-header-theme" />
        {isApplicant && <div className="vs-language" aria-label="Language"><button className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button><span aria-hidden="true">|</span><button className={lang==='hi'?'active':''} onClick={()=>setLang('hi')}>हिन्दी</button></div>}
        <div className="vs-tool-wrap"><button className="vs-icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(!notificationsOpen); setAccountOpen(false); }}><Bell size={20}/>{lastApp && <span className="vs-notification-dot"/>}</button>
          {notificationsOpen && <div className="vs-popover" role="region" aria-label="Notifications"><strong>Notifications</strong><p>{lastApp ? `${lastApp.schemeName}: ${lastApp.status}${lastApp.isExample?' (demo example)':''}` : 'No new updates.'}</p>{lastApp && <button className="vs-text-link" onClick={() => {navigate(`/applications/${lastApp.id}`); setNotificationsOpen(false);}}>View application</button>}</div>}</div>
        <div className="vs-tool-wrap"><button className="vs-account-button" aria-label="Account menu" aria-expanded={accountOpen} onClick={() => {setAccountOpen(!accountOpen);setNotificationsOpen(false);}}><span className="vs-avatar"><UserRound size={20}/></span><span className="vs-account-name">{isApplicant?name:role}</span><ChevronDown size={15}/></button>
          {accountOpen && <div className="vs-popover vs-account-popover" role="menu"><strong>{isApplicant?name:role}</strong><small>Demo account</small>{isApplicant && <button onClick={() => {navigate('/profile');setAccountOpen(false);}}><Settings size={17}/> My profile</button>}<button onClick={signOut}><LogOut size={17}/> Sign out</button></div>}</div>
        <button className="vs-mobile-trigger" aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
      </div>
    </header>
    {menuOpen && <nav className="vs-app-mobile-nav" aria-label="Mobile navigation">{nav.map(item=><NavLink key={item.href} to={item.href} onClick={()=>setMenuOpen(false)}>{t(item.label,item.hi)}</NavLink>)}{isApplicant&&<NavLink to="/profile" onClick={()=>setMenuOpen(false)}>My profile</NavLink>}<button onClick={signOut}>Sign out</button></nav>}
    <div className="vs-app-layout">
      <aside className="vs-app-sidebar" aria-label={isApplicant?'Student sidebar':'Staff sidebar'}>
        <nav>{nav.map(({label,hi,href,icon:Icon})=><NavLink key={href} to={href} className={({isActive})=>isActive?'active':''}><Icon size={20}/>{t(label,hi)}</NavLink>)}</nav>
        {isApplicant && <div className="vs-sidebar-bottom"><button onClick={()=>navigate('/profile')}><UserRound size={18}/> My profile</button><p>Demo frontend · Your updates stay in this browser.</p></div>}
      </aside>
      <main className={`vs-app-main ${isApplicant?'vs-student-main':'vs-staff-main'}`} id="main-content"><Outlet/></main>
    </div>
  </div>;
}
