import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileCheck2, UploadCloud, X, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

export default function DynamicApplication() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { studentProfile, drafts, saveDraft } = useAppContext();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(() => drafts[schemeId]?.step || 0);
  const [formData, setFormData] = useState(() => ({ ...studentProfile, ...drafts[schemeId]?.formData }));
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [fieldError, setFieldError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    api.getScheme(schemeId)
      .then(data => { setScheme(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [schemeId]);

  if (loading) return <div className="vs-page vs-empty"><Activity className="animate-spin" size={32} /><p>Loading scheme…</p></div>;
  if (error || !scheme || scheme.status !== 'Published') return (
    <div className="vs-page vs-empty">
      <h1>Scheme not found</h1>
      <p>{error || 'This scheme is not available.'}</p>
      <Link to="/apply" className="vs-text-link">Back to schemes</Link>
    </div>
  );

  const sections = scheme.config.sections;
  const totalSteps = sections.length + 2;
  const labels = [...sections.map(s => s.title), 'Documents', 'Review & submit'];
  const update = (id, value) => {
    const next = { ...formData, [id]: value };
    setFormData(next);
    saveDraft(schemeId, { formData: next, step });
    setFieldError('');
  };
  const changeStep = next => {
    setStep(next);
    saveDraft(schemeId, { formData, step: next });
    setFieldError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goNext = () => {
    if (step < sections.length) {
      const missing = sections[step].fields.find(f => f.required && !String(formData[f.id] ?? '').trim());
      if (missing) { setFieldError(`Please complete ${missing.label}.`); return; }
    }
    if (step === sections.length) {
      const missing = scheme.config.documents.find(d => d.required && !uploadedDocs[d.id]);
      if (missing) { setFieldError(`Please select ${missing.name}.`); return; }
    }
    changeStep(Math.min(step + 1, totalSteps - 1));
  };
  const upload = (doc, file) => {
    if (!file) return;
    if (file.size > doc.maxSize) { setFieldError(`${doc.name} exceeds the size limit.`); return; }
    if (doc.format && file.type !== doc.format) { setFieldError(`${doc.name} must be ${doc.format === 'application/pdf' ? 'a PDF' : 'a JPEG'} file.`); return; }
    setUploadedDocs(cur => ({ ...cur, [doc.id]: { name: file.name, size: file.size, status: 'Ready' } }));
    setFieldError('');
  };

  const handleSubmit = async () => {
    const missing = scheme.config.documents.find(d => d.required && !uploadedDocs[d.id]);
    if (missing) { changeStep(sections.length); setFieldError(`Please select ${missing.name} again before submitting.`); return; }
    if (!confirmed) { setFieldError('Please confirm the declaration before submitting.'); return; }
    setSubmitting(true);
    try {
      const result = await api.submitApplication({
        schemeId: scheme.id,
        formData,
        documents: Object.entries(uploadedDocs).map(([docId, file]) => ({ id: docId, name: file.name, status: 'Ready' }))
      });
      navigate(`/applications/${result.id}`, { replace: true, state: { justSubmitted: true } });
    } catch (err) {
      setFieldError(`Submission failed: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="vs-page vs-apply-page">
      <Link to={`/schemes/${scheme.id}`} className="vs-back-link"><ArrowLeft size={17} /> Back to scheme details</Link>
      <div className="vs-page-head">
        <div>
          <span className="vs-kicker">APPLICATION</span>
          <h1>Apply for {scheme.shortName}</h1>
          <p>{scheme.name}</p>
        </div>
        <span className="vs-progress-pill">Step {step + 1} of {totalSteps}</span>
      </div>
      <div className="vs-apply-progress">
        <div className="vs-progress-line"><span style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} /></div>
        <div className="vs-apply-labels">
          {labels.map((label, index) => (
            <button key={label} className={index === step ? 'active' : index < step ? 'complete' : ''} onClick={() => { if (index <= step) changeStep(index); }} disabled={index > step}>
              {index < step ? <Check size={14} /> : index + 1}<span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <section className="vs-panel vs-form-panel">
        {step < sections.length && (
          <>
            <div className="vs-form-title"><h2>{sections[step].title}</h2><p>Fields marked with * are required.</p></div>
            <div className="vs-form-grid">
              {sections[step].fields.map(field => (
                <div className="vs-field" key={field.id}>
                  <label htmlFor={field.id}>{field.label} {field.required ? '*' : ''}</label>
                  {field.type === 'select' ? (
                    <select id={field.id} value={formData[field.id] ?? ''} onChange={e => update(field.id, e.target.value)}>
                      <option value="">Select an option</option>
                      {field.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input id={field.id} type={field.type} value={formData[field.id] ?? ''} onChange={e => update(field.id, e.target.value)} min={field.type === 'number' ? '0' : undefined} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {step === sections.length && (
          <>
            <div className="vs-form-title"><h2>Document checklist</h2><p>Upload your supporting documents.</p></div>
            <div className="vs-doc-list">
              {scheme.config.documents.map(doc => (
                <div className="vs-doc-row" key={doc.id}>
                  <span className="vs-icon-box"><FileCheck2 size={22} /></span>
                  <div>
                    <strong>{doc.name} {doc.required ? '*' : ''}</strong>
                    <small>{doc.format === 'application/pdf' ? 'PDF' : 'JPEG'} · Max {(doc.maxSize / 1048576).toFixed(1)} MB</small>
                  </div>
                  {uploadedDocs[doc.id] ? (
                    <div className="vs-uploaded">
                      <span title={uploadedDocs[doc.id].name}>{uploadedDocs[doc.id].name}</span>
                      <button aria-label={`Remove ${doc.name}`} onClick={() => setUploadedDocs(cur => { const n = { ...cur }; delete n[doc.id]; return n; })}><X size={16} /></button>
                    </div>
                  ) : (
                    <label className="vs-button vs-button-outline vs-upload-button">
                      <UploadCloud size={17} /> Choose file
                      <input type="file" accept={doc.format} onChange={e => upload(doc, e.target.files?.[0])} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {step === totalSteps - 1 && (
          <>
            <div className="vs-form-title"><h2>Review your application</h2><p>Make sure your entries are correct before submitting.</p></div>
            {sections.map(section => (
              <div className="vs-review-group" key={section.title}>
                <h3>{section.title}</h3>
                <div className="vs-review-grid">
                  {section.fields.map(field => (
                    <div key={field.id}><span>{field.label}</span><strong>{formData[field.id] || '—'}</strong></div>
                  ))}
                </div>
              </div>
            ))}
            <div className="vs-review-group">
              <h3>Selected documents</h3>
              <ul className="vs-check-list">
                {scheme.config.documents.map(doc => <li key={doc.id}><span>✓</span>{doc.name}: {uploadedDocs[doc.id]?.name || <em style={{ color: 'red' }}>Missing</em>}</li>)}
              </ul>
            </div>
            <label className="vs-declaration">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
              <span>I declare that the information provided is true and correct to the best of my knowledge.</span>
            </label>
          </>
        )}
        {fieldError && <p className="vs-error" role="alert">{fieldError}</p>}
        <div className="vs-form-actions">
          <button className="vs-button vs-button-outline" disabled={step === 0} onClick={() => changeStep(step - 1)}>Previous</button>
          {step === totalSteps - 1
            ? <button className="vs-button vs-button-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'} {!submitting && <ArrowRight size={18} />}</button>
            : <button className="vs-button vs-button-primary" onClick={goNext}>Save & continue <ArrowRight size={18} /></button>
          }
        </div>
      </section>
    </div>
  );
}
