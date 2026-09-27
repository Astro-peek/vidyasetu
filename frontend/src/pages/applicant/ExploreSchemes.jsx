import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../../services/api';
import { SchemeCard } from '../../components/StudentUI';
import { useAppContext } from '../../context/AppContext';

export default function ExploreSchemes() {
  const { t } = useAppContext();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    api.getSchemes()
      .then(data => { setSchemes(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="vs-page vs-catalog">
      <div className="vs-page-head"><h1>{t('Explore schemes', 'योजनाएं खोजें')}</h1></div>
      <div className="vs-empty"><p>Loading schemes…</p></div>
    </div>
  );

  if (error) return (
    <div className="vs-page vs-catalog">
      <div className="vs-empty">
        <h3>Could not load schemes</h3>
        <p>{error}</p>
        <button className="vs-button vs-button-outline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  const published = schemes.filter(s => s.status === 'Published');
  const filtered = published.filter(s => {
    const text = `${s.name} ${s.description} ${s.educationLevel}`.toLowerCase();
    const matchLevel = level === 'all' || (level === 'research' ? /ph\.d|postgrad|fellowship/i.test(s.educationLevel + ' ' + s.name) : level === 'overseas' ? s.id === 'nos' : /undergrad/i.test(s.educationLevel));
    return text.includes(query.trim().toLowerCase()) && matchLevel;
  });

  return (
    <div className="vs-page vs-catalog">
      <div className="vs-page-head">
        <div>
          <span className="vs-kicker">SCHOLARSHIP DISCOVERY</span>
          <h1>{t('Explore schemes', 'योजनाएं खोजें')}</h1>
          <p>{t('Find scholarships and fellowships that fit your education journey.', 'अपनी शिक्षा के अनुरूप छात्रवृत्ति और फेलोशिप खोजें।')}</p>
        </div>
      </div>
      <div className="vs-searchbar">
        <Search size={21} />
        <label className="sr-only" htmlFor="scheme-search">Search scholarships</label>
        <input id="scheme-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by scheme, course or keyword" />
        {query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={18} /></button>}
      </div>
      <div className="vs-filter-row">
        <div className="vs-filter-title"><SlidersHorizontal size={18} /> Filter by study level</div>
        <div className="vs-filter-pills">
          {[['all', 'All schemes'], ['undergraduate', 'Undergraduate'], ['research', 'Postgraduate / research'], ['overseas', 'Overseas']].map(([value, label]) => (
            <button key={value} className={level === value ? 'active' : ''} onClick={() => setLevel(value)} aria-pressed={level === value}>{label}</button>
          ))}
        </div>
      </div>
      <div className="vs-results-heading">
        <h2>{filtered.length} {filtered.length === 1 ? 'scheme' : 'schemes'} found</h2>
        <p>Illustrative catalog · Confirm current criteria and application dates in official notifications.</p>
      </div>
      {filtered.length ? (
        <div className="vs-catalog-grid">{filtered.map(s => <SchemeCard key={s.id} scheme={s} />)}</div>
      ) : (
        <div className="vs-empty">
          <Search size={34} />
          <h3>No schemes match your search</h3>
          <p>Try a different keyword or filter.</p>
          <button className="vs-button vs-button-outline" onClick={() => { setQuery(''); setLevel('all'); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
