import { ArrowRight, BookOpen, Check, ClipboardList, FileSearch, GraduationCap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SchemeCard({ scheme, compact = false, onView }) {
  return <article className={`vs-scheme-card ${compact ? 'vs-scheme-card-compact' : ''}`}>
    <div className="vs-scheme-top">
      <span className="vs-icon-box">{scheme.id === 'nos' ? <MapPin size={24} /> : scheme.id === 'tce' ? <BookOpen size={24} /> : <GraduationCap size={24} />}</span>
      <div><h3>{scheme.name}</h3><p>{scheme.description}</p></div>
    </div>
    <div className="vs-chips"><span>ST students</span><span>{scheme.educationLevel}</span></div>
    <Link className="vs-text-link" to={`/schemes/${scheme.id}`} onClick={onView}>View scheme <ArrowRight size={17} /></Link>
  </article>;
}

export function ApplicationJourney({ app, compact = false }) {
  const stages = ['Submitted', 'Under review', 'Decision'];
  const status = app?.status || 'Submitted';
  const current = ['Selected', 'Rejected', 'Shortlisted'].includes(status) ? 2 : status === 'Submitted' ? 0 : 1;
  return <div className={`vs-journey ${compact ? 'vs-journey-compact' : ''}`} aria-label={`Application status: ${status}`}>
    {stages.map((stage, index) => <div key={stage} className={`vs-journey-step ${index < current ? 'complete' : ''} ${index === current ? 'current' : ''}`}>
      <span className="vs-journey-dot">{index < current ? <Check size={13} strokeWidth={3} /> : ''}</span>
      <span>{stage}</span>
    </div>)}
  </div>;
}

export function JourneyStrip() {
  const steps = [
    { icon: FileSearch, title: 'Find a scheme', text: 'Explore scholarships for ST students.' },
    { icon: ClipboardList, title: 'Check eligibility', text: 'Review the criteria before you apply.' },
    { icon: GraduationCap, title: 'Apply & track', text: 'Submit a demo application and follow its progress.' },
  ];
  return <section className="vs-steps" id="how-it-works" aria-label="How Vidya Setu works">
    <div className="vs-steps-title"><h2>Your application journey</h2><p>From discovery to decision, all in one place.</p></div>
    {steps.map(({ icon: Icon, title, text }, i) => <div className="vs-step" key={title}>
      <span className="vs-round-icon"><Icon size={24} /></span>
      <div><h3>{title}</h3><p>{text}</p></div>
      {i < steps.length - 1 && <ArrowRight className="vs-step-arrow" size={18} aria-hidden="true" />}
    </div>)}
  </section>;
}
