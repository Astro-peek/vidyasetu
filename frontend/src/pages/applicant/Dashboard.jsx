import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ClipboardCheck, Clock3, Search, Sparkles, UserRound } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import { SchemeCard, ApplicationJourney } from '../../components/StudentUI';

const groups = [
  ['Personal details', ['fullName','dob','category']],
  ['Contact details', ['email','phone']],
  ['Academic details', ['courseName','university']],
  ['Other details', ['state','familyIncome']],
];
export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { studentProfile, studentApplications, t, openAssistant } = useAppContext();
  const [schemes, setSchemes] = useState([]);
  const completed = groups.map(([,fields])=>fields.every(f=>String(studentProfile[f]??'').trim()));
  const count = completed.filter(Boolean).length;
  const app = studentApplications[0];
  const name = studentProfile.fullName?.trim().split(' ')[0] || t('student','छात्र');

  useEffect(() => {
    let mounted = true;
    api.getSchemes().then(data => {
      if (mounted) setSchemes(data || []);
    }).catch(err => console.error('Failed to load schemes:', err));
    return () => { mounted = false; };
  }, []);

  return <div className="vs-dashboard vs-page">
    <div className="vs-page-head vs-dashboard-head"><div><span className="vs-kicker">STUDENT DASHBOARD</span><h1>{t('Welcome back,','वापसी पर स्वागत है,')} <em>{name}</em></h1><p>{t('Your scholarships, applications and next steps in one place.','आपकी छात्रवृत्ति, आवेदन और अगले कदम एक ही जगह।')}</p></div><button className="vs-button vs-button-primary" onClick={()=>navigate('/apply')}>{t('Explore scholarships','छात्रवृत्ति खोजें')} <ArrowRight size={20}/></button></div>

    <div className="vs-dashboard-grid">
      <div className="vs-dashboard-main">
        <section className="vs-profile-feature" aria-labelledby="profile-feature-title">
          <div className="vs-profile-art" aria-hidden="true"><svg viewBox="0 0 390 170" fill="none"><path d="M0 157c39-18 83-20 122-9 62-61 109-39 152-10 46-27 88-31 116-22M32 169c43-17 95-12 133-7 42-22 94-20 131-5" stroke="currentColor"/><path d="M197 147v-27l45-22 45 22v27m-90-22 45-21 45 21m-67 21v-17h43v17M82 147V95m-23 52v-34l23-33 23 33v34" stroke="currentColor"/><path d="M200 120h85M20 145h346" stroke="currentColor"/></svg></div>
          <div className="vs-profile-feature-content"><div className="vs-profile-feature-top"><h2 id="profile-feature-title">{t('Complete your','अपनी')} <em>{t('profile','प्रोफ़ाइल')}</em></h2><span>{count} of 4 steps</span></div><p>{t('Add your details to find schemes that may be relevant to you.','आपके लिए प्रासंगिक योजनाएं खोजने हेतु विवरण जोड़ें।')}</p><div className="vs-profile-steps">{groups.map(([label],i)=><div key={label} className={completed[i]?'done':''}><span>{completed[i]?<Check size={16}/>:i+1}</span><small>{label}</small></div>)}</div><button className="vs-button vs-button-primary" onClick={()=>navigate('/profile')}>{count===4?'Review profile':'Continue profile'} <ArrowRight size={18}/></button></div>
        </section>
        <section className="vs-recommendations" aria-labelledby="recommend-title"><div className="vs-section-heading"><div><h2 id="recommend-title">{t('Recommended for you','आपके लिए सुझाई गई योजनाएं')}</h2><p>{t('Start with these schemes, then check the official eligibility criteria.','इन योजनाओं से शुरुआत करें और आधिकारिक पात्रता शर्तें जाँचें।')}</p></div><button className="vs-text-link" onClick={()=>navigate('/apply')}>Explore all schemes <ArrowRight size={17}/></button></div><div className="vs-recommend-grid">{schemes.filter(s=>s.id==='nfst'||s.id==='tce').map(s=><SchemeCard key={s.id} scheme={s}/>)}</div></section>
      </div>
      <div className="vs-dashboard-side">
        <section className="vs-panel vs-current-application" aria-labelledby="current-app-heading"><div className="vs-panel-heading"><h2 id="current-app-heading">{t('Your application','आपका आवेदन')}</h2><button className="vs-text-link" onClick={()=>navigate('/applications')}>View all <ArrowRight size={17}/></button></div>{app?<><div className="vs-status-preview"><strong>{app.schemeName}</strong><span>Application ID: {app.id}</span><ApplicationJourney app={app} compact/></div><button className="vs-application-update" onClick={()=>navigate(`/applications/${app.id}`)}><Clock3 size={20}/><span><strong>{app.isExample?'Example application':'Your application is '+app.status.toLowerCase()}</strong><small>{app.isExample?'Demo data · Open to see how tracking works.':'Open for details and updates.'}</small></span><ArrowRight size={16}/></button></>:<div className="vs-empty-inline">No applications yet. <button onClick={()=>navigate('/apply')}>Explore a scheme</button></div>}</section>
        <section className="vs-panel vs-next-steps" aria-labelledby="next-title"><h2 id="next-title">{t('What to do next','अगला कदम')}</h2><button onClick={()=>navigate('/profile')}><span className="vs-icon-box"><UserRound size={20}/></span><span><strong>Complete your profile</strong><small>Add details to personalize your search.</small></span><ArrowRight size={18}/></button><button onClick={()=>navigate('/apply')}><span className="vs-icon-box"><Search size={20}/></span><span><strong>Review scheme eligibility</strong><small>Check the latest criteria before applying.</small></span><ArrowRight size={18}/></button><button onClick={()=>navigate('/applications')}><span className="vs-icon-box"><ClipboardCheck size={20}/></span><span><strong>Track application</strong><small>View your saved demo applications.</small></span><ArrowRight size={18}/></button></section>
        <section className="vs-panel vs-ask" aria-labelledby="ask-title"><div className="vs-ask-title"><Sparkles size={20}/><div><h2 id="ask-title">Ask Vidya</h2><p>Questions about eligibility? Ask here.</p></div></div><p className="vs-answer">Chat, check scheme eligibility or try document pre-screening from the assistant available on every page.</p><button className="vs-button vs-button-primary" onClick={()=>openAssistant('chat')}>Open SetuAI assistant <ArrowRight size={17}/></button><small>Demo guidance only · Verify the official notification.</small></section>
      </div>
    </div>
  </div>;
}
