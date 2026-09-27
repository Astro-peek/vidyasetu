import { Link } from 'react-router-dom';

export default function Brand({ onClick }) {
  return <Link to="/" className="vs-brand" aria-label="Vidya Setu home" onClick={onClick}>
    <span className="vs-brand-mark"><span>V</span><span>S</span></span>
    <span>Vidya Setu</span>
  </Link>;
}
