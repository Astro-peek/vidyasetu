import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, Clock3, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { ApplicationJourney } from '../../components/StudentUI';

export default function MyApplications() {
  const { studentApplications, t } = useAppContext();
  const navigate = useNavigate();
  const [serverApps, setServerApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications()
      .then(data => { setServerApps(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false)); // Fail gracefully — show local apps
  }, []);

  // Merge: server apps first, then local-only apps not already in server list
  const allApps = [
    ...serverApps,
    ...studentApplications.filter(la => !serverApps.find(sa => sa.id === la.id) && !la.isExample)
  ];

  if (loading) return (
    <div className="vs-page">
      <div className="vs-page-head"><h1>{t('My applications', 'मेरे आवेदन')}</h1></div>
      <div className="vs-empty"><Activity className="animate-spin" size={32} /><p>Loading applications…</p></div>
    </div>
  );

  return (
    <div className="vs-page">
      <div className="vs-page-head">
        <div>
          <span className="vs-kicker">APPLICATION TRACKER</span>
          <h1>{t('My applications', 'मेरे आवेदन')}</h1>
          <p>{t('See where each application stands and what to do next.', 'हर आवेदन की स्थिति और अगला कदम देखें।')}</p>
        </div>
        <button className="vs-button vs-button-primary" onClick={() => navigate('/apply')}>Explore schemes <ArrowRight size={18} /></button>
      </div>
      {allApps.length ? (
        <div className="vs-application-list">
          {allApps.map(app => (
            <article className="vs-panel vs-application-row" key={app.id}>
              <div className="vs-application-row-head">
                <div>
                  <span className="vs-id">{app.id}</span>
                  <h2>{app.schemeName}</h2>
                  <p><Clock3 size={15} /> {new Date(app.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`vs-status-badge ${app.status === 'Deficiency' ? 'attention' : ''}`}>{app.status}</span>
              </div>
              <ApplicationJourney app={app} />
              <Link className="vs-text-link" to={`/applications/${app.id}`}>View details <ArrowRight size={17} /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="vs-empty">
          <ClipboardList size={36} />
          <h2>No applications yet</h2>
          <p>Explore a scheme and complete an application to see it here.</p>
          <Link className="vs-button vs-button-primary" to="/apply">Explore schemes</Link>
        </div>
      )}
    </div>
  );
}
