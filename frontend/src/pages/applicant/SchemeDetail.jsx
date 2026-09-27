import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ClipboardList, FileText, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../../services/api';

export default function SchemeDetail() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getScheme(schemeId)
      .then(data => { setScheme(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [schemeId]);

  if (loading) return <div className="vs-page vs-empty"><Activity className="animate-spin" size={32} /><p>Loading…</p></div>;
  if (error || !scheme) return (
    <div className="vs-page vs-empty">
      <h1>Scheme not found</h1>
      <p>{error}</p>
      <Link className="vs-text-link" to="/apply">Back to schemes</Link>
    </div>
  );

  return (
    <div className="vs-page vs-detail">
      <Link className="vs-back-link" to="/apply"><ArrowLeft size={17} /> Back to schemes</Link>
      <div className="vs-page-head">
        <div>
          <span className="vs-kicker">SCHOLARSHIP DETAILS</span>
          <h1>{scheme.name}</h1>
          <p>{scheme.description}</p>
        </div>
        <button className="vs-button vs-button-primary" onClick={() => navigate(`/apply/${scheme.id}`)}>
          Start application <ArrowRight size={19} />
        </button>
      </div>
      <div className="vs-detail-grid">
        <div className="vs-detail-main">
          <section className="vs-panel">
            <div className="vs-detail-heading"><BookOpen /><h2>At a glance</h2></div>
            <p>Scheme rules and availability may change; always verify the latest official notification before applying.</p>
            <div className="vs-detail-facts">
              <div><span>Designed for</span><strong>Scheduled Tribe students</strong></div>
              <div><span>Study level</span><strong>{scheme.educationLevel}</strong></div>
              <div><span>Application closes</span><strong>{scheme.closingDate ? new Date(scheme.closingDate).toLocaleDateString('en-IN') : 'Check official notification'}</strong></div>
            </div>
          </section>
          <section className="vs-panel">
            <div className="vs-detail-heading"><ClipboardList /><h2>Information you will need</h2></div>
            <div className="vs-detail-sections">
              {scheme.config.sections.map(s => (
                <div key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.fields.map(f => f.label).join(' · ')}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="vs-detail-aside">
          <section className="vs-panel">
            <div className="vs-detail-heading"><FileText /><h2>Document checklist</h2></div>
            <ul className="vs-check-list">
              {scheme.config.documents.map(d => <li key={d.id}><span>✓</span>{d.name}</li>)}
            </ul>
          </section>
          <section className="vs-notice">
            <ShieldCheck size={21} />
            <div>
              <strong>Before you apply</strong>
              <p>Please consult current official scheme guidelines on the MoTA portal.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
