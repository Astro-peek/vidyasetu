import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserRound } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const sections = [
  { title: 'Personal details', fields: [{id:'fullName',label:'Full name',type:'text',placeholder:'Your name'},{id:'dob',label:'Date of birth',type:'date'},{id:'category',label:'Category',type:'select',options:['ST']}] },
  { title: 'Contact details', fields: [{id:'email',label:'Email address',type:'email',placeholder:'name@example.com'},{id:'phone',label:'Mobile number',type:'tel',placeholder:'10-digit number'}] },
  { title: 'Academic details', fields: [{id:'courseName',label:'Current course / degree',type:'text',placeholder:'For example, M.Sc. Physics'},{id:'university',label:'Institution',type:'text',placeholder:'College or university name'}] },
  { title: 'Other details', fields: [{id:'state',label:'State / UT',type:'text',placeholder:'Your state'},{id:'familyIncome',label:'Annual family income (optional)',type:'number',placeholder:'Amount in ₹'}] },
];

export default function Profile() {
  const { studentProfile, setStudentProfile } = useAppContext();
  const [saved, setSaved] = useState(false);
  const update = (id,value) => { setStudentProfile(current=>({...current,[id]:value})); setSaved(false); };
  const count = sections.filter(s=>s.fields.filter(f=>f.id!=='familyIncome').every(f=>String(studentProfile[f.id]??'').trim())).length;
  return <div className="vs-page vs-profile-page"><Link to="/applicant/dashboard" className="vs-back-link"><ArrowLeft size={17}/> Back to dashboard</Link><div className="vs-page-head"><div><span className="vs-kicker">YOUR PROFILE</span><h1>Tell us about yourself</h1><p>These details personalize your demo experience and stay in this browser.</p></div><span className="vs-progress-pill"><UserRound size={18}/>{count} of 4 sections complete</span></div>
    <div className="vs-notice"><span aria-hidden="true">ⓘ</span><p>This is a prototype. Please use sample details, not real personal documents or sensitive information.</p></div>
    <form onSubmit={e=>{e.preventDefault();setSaved(true);}} className="vs-profile-form">{sections.map((section,index)=><section className="vs-panel" key={section.title}><div className="vs-profile-section-title"><span>{String(index+1).padStart(2,'0')}</span><h2>{section.title}</h2></div><div className="vs-form-grid">{section.fields.map(field=><div className="vs-field" key={field.id}><label htmlFor={field.id}>{field.label}</label>{field.type==='select'?<select id={field.id} value={studentProfile[field.id]||''} onChange={e=>update(field.id,e.target.value)}><option value="">Select category</option>{field.options.map(o=><option key={o}>{o}</option>)}</select>:<input id={field.id} type={field.type} value={studentProfile[field.id]||''} placeholder={field.placeholder} onChange={e=>update(field.id,e.target.value)} min={field.type==='number'?'0':undefined}/>}</div>)}</div></section>)}<div className="vs-form-footer"><span>Changes are saved automatically on this device.</span><button className="vs-button vs-button-primary" type="submit">Save profile</button></div>{saved&&<div className="vs-success" role="status"><CheckCircle2 size={18}/> Profile saved in this browser.</div>}</form>
  </div>;
}
