import { useLocation, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, FileText, UploadCloud, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ApplicationJourney } from '../../components/StudentUI';

export default function ApplicationStatus() {
  const { id } = useParams();
  const location = useLocation();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [replacement, setReplacement] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getApplication(id)
      .then(data => { setApp(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="vs-page vs-empty"><Activity className="animate-spin" size={32} /><h1>Loading application...</h1></div>;
  if (error || !app) return <div className="vs-page vs-empty"><ClipboardList size={32} /><h1>Application not found</h1><p>{error}</p><Link to="/applications" className="vs-text-link">Back to applications</Link></div>;

  const deficiency = app.documents?.find(d => d.status === 'Flagged');
  
  const submitCorrection = async () => {
    if (!replacement) { setMessage('Select a replacement document first.'); return; }
    try {
      // Assuming you want to tell backend the deficiency was resolved
      await api.transitionApplication(app.id, 'Under Scrutiny', 'Applicant uploaded correction: ' + replacement.name);
      
      setMessage('Correction accepted.');
      setReplacement(null);
      // Reload app
      const updated = await api.getApplication(id);
      setApp(updated);
    } catch(err) {
      setMessage('Failed to submit correction: ' + err.message);
    }
  };

  return (
    <div className="vs-page vs-application-detail">
      <Link className="vs-back-link" to="/applications"><ArrowLeft size={17} /> All applications</Link>
      <div className="vs-page-head">
        <div>
          <span className="vs-kicker">APPLICATION TRACKING</span>
          <h1>{app.schemeName}</h1>
          <p>Application ID: {app.id} {app.isExample ? '· Demo example' : ''}</p>
        </div>
        <span className={`vs-status-badge ${app.status === 'Deficiency' ? 'attention' : ''}`}>{app.status}</span>
      </div>
      
      {location.state?.justSubmitted && <div className="vs-success" role="status"><CheckCircle2 size={20} /> Your application was submitted successfully.</div>}
      
      <div className="vs-detail-grid">
        <div className="vs-detail-main">
          <section className="vs-panel">
            <h2>Application journey</h2>
            <p className="vs-muted">Follow the progress of your application.</p>
            <ApplicationJourney app={app} />
          </section>
          
          {deficiency && (
            <section className="vs-panel vs-deficiency">
              <h2>Action required: document correction</h2>
              <p>{deficiency.officerRemark || deficiency.deficiency || 'Please provide a clearer document.'}</p>
              <label className="vs-upload-inline">
                <UploadCloud size={19} /> Choose replacement file
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                  const file = e.target.files?.[0]; 
                  if (file?.size > 5 * 1048576) { 
                    setMessage('Maximum size is 5 MB.'); 
                    setReplacement(null); 
                  } else { 
                    setReplacement(file); 
                    setMessage(''); 
                  }
                }} />
              </label>
              {replacement && <span className="vs-file-name">{replacement.name}</span>}
              <button className="vs-button vs-button-primary" onClick={submitCorrection}>Submit correction</button>
              {message && <p role="status">{message}</p>}
            </section>
          )}
          
          <section className="vs-panel">
            <div className="vs-detail-heading"><FileText /><h2>Application details</h2></div>
            {Object.keys(app.formData || {}).length ? (
              <div className="vs-review-grid">
                {Object.entries(app.formData).map(([key, value]) => (
                  <div key={key}>
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            ) : <p className="vs-muted">No personal details shown.</p>}
          </section>
          
          <section className="vs-panel">
            <h2>Documents</h2>
            {app.documents?.length ? (
              <ul className="vs-check-list">
                {app.documents.map((doc, index) => (
                  <li key={`${doc.id}-${index}`}><span>✓</span>{doc.name} · {doc.status}</li>
                ))}
              </ul>
            ) : <p className="vs-muted">No documents.</p>}
          </section>
        </div>
        
        <aside className="vs-detail-aside">
          <section className="vs-panel">
            <h2>Activity</h2>
            <div className="vs-activity">
              {app.timeline?.map((event, index) => (
                <div key={index}>
                  <span className="vs-activity-dot" />
                  <strong>{event.action}</strong>
                  <small>{event.time} · {event.actor}</small>
                  {event.details && <p>{event.details}</p>}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
