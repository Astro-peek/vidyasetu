import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';
const faqs=[
  ['How do I find a scholarship?','Use Explore Schemes to search and filter the demo catalog. Open each scheme for the document checklist and then verify the current official notification.'],
  ['Can I check whether I am eligible?','Review the criteria in the latest official scheme notification. This frontend can guide you to relevant sections, but cannot make a binding eligibility decision.'],
  ['How do I track my application?','Open My Applications. Applications created here are stored only in your browser as demo records and are not connected to the ministry.'],
  ['Are my documents uploaded to MoTA?','No. File selection in this prototype only demonstrates the form flow. The files are not transmitted to a server or to MoTA.'],
];
export default function Help(){const [open,setOpen]=useState(0);return <div className="vs-page vs-help"><div className="vs-page-head"><div><span className="vs-kicker">WE ARE HERE TO GUIDE YOU</span><h1>Help & guidance</h1><p>Simple answers as you explore scholarships and applications.</p></div><HelpCircle size={36} className="vs-help-icon"/></div><div className="vs-help-grid"><section className="vs-panel"><h2>Frequently asked questions</h2><div className="vs-faq">{faqs.map(([q,a],i)=><div key={q}><button aria-expanded={open===i} onClick={()=>setOpen(open===i?-1:i)}>{q}<span>{open===i?'−':'+'}</span></button>{open===i&&<p>{a}</p>}</div>)}</div></section><aside className="vs-panel vs-help-side"><h2>Start with the essentials</h2><p>Discover a scheme, review its checklist, complete your profile, and follow your demo application.</p><Link className="vs-text-link" to="/apply">Explore schemes <ArrowRight size={17}/></Link><Link className="vs-text-link" to="/profile">Complete your profile <ArrowRight size={17}/></Link></aside></div></div>}
