import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, Button, Badge } from '../../components/CommonUI';
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, Check, X, AlertTriangle, MessageSquare, FileText, FileCheck, Info, Activity } from 'lucide-react';
import StatusTimeline from '../../components/StatusTimeline';

export default function ScrutinyWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  const [rightTab, setRightTab] = useState('rules');
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [mobileViewPane, setMobileViewPane] = useState('center');
  const [remarks, setRemarks] = useState('Please upload a clearer copy of this document.');
  const [selectedDocs, setSelectedDocs] = useState({});

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await api.getApplication(id);
        setApp(data);
        if (data && data.documents?.length > 0) {
          const flaggedDoc = data.documents.find(d => d.status === 'Flagged' || d.aiCheck === 'Issue Found') || data.documents[0];
          setActiveDoc(flaggedDoc);
          if (data.aiFlags > 0) setRightTab('flags');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (loading) return <div className="p-8 text-center"><Activity className="w-8 h-8 mx-auto animate-spin" /></div>;
  if (!app) return <div className="p-8 text-center text-gray-500">Application not found</div>;

  const handleAction = async (action) => {
    if (action === 'deficiency') {
      setShowDeficiencyModal(true);
    } else {
      const targetState = action === 'Mark Eligible' ? 'Eligible' : 'Rejected';
      try {
        await api.transitionApplication(id, targetState, `Officer marked application as ${targetState}`);
        navigate('/scrutiny');
      } catch (err) {
        alert('Action failed: ' + err.message);
      }
    }
  };

  const handleDeficiencySubmit = async () => {
    const items = Object.entries(selectedDocs).filter(([, selected]) => selected).map(([docId]) => docId);
    if (!items.length && Object.keys(selectedDocs).length > 0) {
      alert("Please select at least one document.");
      return;
    }
    
    // Default to the active document if none selected during interaction
    const finalItems = items.length ? items : (activeDoc ? [activeDoc.id] : []);

    try {
      await api.raiseDeficiency(id, {
        items: finalItems,
        remarks,
        dueDate: '2026-09-28'
      });
      setShowDeficiencyModal(false);
      navigate('/scrutiny');
    } catch (err) {
      alert('Failed to raise deficiency: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0c1821] text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Top Bar */}
      <div className="bg-white dark:bg-[#152530] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap gap-4 justify-between items-center shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hidden md:flex" onClick={() => navigate('/scrutiny')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">{app.id}</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 hidden sm:inline-flex">Under Scrutiny</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{app.applicantName} • <span className="uppercase text-teal-600 dark:text-teal-400 font-bold">{app.schemeId}</span></p>
          </div>
        </div>
        
        {/* Mobile Pane Switcher */}
        <div className="flex md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full mb-2">
          <button onClick={() => setMobileViewPane('left')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${mobileViewPane === 'left' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Summary</button>
          <button onClick={() => setMobileViewPane('center')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${mobileViewPane === 'center' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Document</button>
          <button onClick={() => setMobileViewPane('right')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${mobileViewPane === 'right' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Analysis</button>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => handleAction('deficiency')} className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-lg text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shadow-sm">Raise Deficiency</button>
          <button onClick={() => handleAction('Mark Ineligible')} className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-lg text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors shadow-sm">Mark Ineligible</button>
          <button onClick={() => handleAction('Mark Eligible')} className="flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm">Mark Eligible</button>
        </div>
      </div>

      {/* Workspace Three Panes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Pane - Summary & Documents */}
        <div className={`w-full md:w-72 lg:w-80 bg-white dark:bg-[#14232c] border-r border-slate-200 dark:border-slate-800 overflow-y-auto flex-col z-10 ${mobileViewPane === 'left' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Applicant Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Name</span><span className="font-bold text-slate-900 dark:text-slate-100">{app.applicantName}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Scheme</span><span className="font-bold text-slate-900 dark:text-slate-100 uppercase">{app.schemeId}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Submitted</span><span className="font-medium text-slate-700 dark:text-slate-300">{new Date(app.submittedDate).toLocaleDateString()}</span></div>
            </div>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 pt-2">Documents List</h2>
            <div className="space-y-2">
              {app.documents?.map(doc => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => { setActiveDoc(doc); setMobileViewPane('center'); }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500/60 ring-2 ring-teal-500/40 shadow-sm'
                        : 'bg-white dark:bg-[#182a35] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-1.5 rounded-lg shrink-0 ${doc.aiCheck === 'Issue Found' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                        {doc.aiCheck === 'Issue Found' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <FileCheck className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`truncate ${isSelected ? 'font-bold text-teal-900 dark:text-teal-200' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {doc.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Pane - Document Viewer */}
        <div className={`flex-1 flex-col bg-slate-100/70 dark:bg-[#0e1a22] overflow-hidden relative ${mobileViewPane === 'center' ? 'flex' : 'hidden md:flex'}`}>
          {activeDoc ? (
            <>
              {/* Document Toolbar */}
              <div className="bg-white dark:bg-[#152530] border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex justify-between items-center shadow-sm z-10">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{activeDoc.name}</span>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ZoomOut className="w-4 h-4" /></Button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-12 text-center">100%</span>
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ZoomIn className="w-4 h-4" /></Button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><RotateCw className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Document Image Placeholder */}
              <div className="flex-1 p-4 md:p-6 overflow-auto flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="bg-white dark:bg-[#172732] w-full max-w-3xl min-h-[420px] md:min-h-[550px] shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center text-slate-400 relative z-10 transition-transform duration-300 p-6">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-5">
                    <FileText className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-center">Document preview for <span className="text-teal-600 dark:text-teal-400 font-bold">{activeDoc.name}</span></p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Use toolbar to zoom and pan.</p>
                </div>
              </div>

              {/* Extraction comparison panel */}
              {activeDoc.extracted && (
                <div className="max-h-72 bg-white dark:bg-[#14232c] border-t border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-20">
                  <div className="px-5 py-3 bg-white dark:bg-[#14232c] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> AI Extraction vs Application
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 bg-slate-50/60 dark:bg-[#0e1921]">
                    {Object.entries(activeDoc.extracted).map(([field, data]) => {
                      const isLowConfidence = data.confidence < 80;
                      const appValue = app.formData?.[field];
                      const isMatch = appValue && String(appValue) === String(data.value);
                      
                      return (
                        <div key={field} className={`p-4 rounded-xl border bg-white dark:bg-[#172732] shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${isLowConfidence ? 'ring-2 ring-amber-500/50 border-amber-400/40 bg-amber-500/5 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700/80'}`}>
                          <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                            
                            <div className="space-y-2 text-sm">
                              {appValue && (
                                <div className="flex justify-between items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <span className="text-slate-500 dark:text-slate-400 text-xs shrink-0 font-medium">Application</span>
                                  <span className="font-bold text-slate-900 dark:text-slate-100 text-right truncate">{appValue}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center gap-2 pt-1">
                                <span className="text-slate-500 dark:text-slate-400 text-xs shrink-0 font-medium">Extracted</span>
                                <span className={`font-bold text-right truncate ${isLowConfidence ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>{data.value}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-[11px] font-black tracking-wide ${isLowConfidence ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {data.confidence}% CONFIDENCE
                            </span>
                            {isMatch && !isLowConfidence && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap">MATCH</span>}
                            {isLowConfidence && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse whitespace-nowrap">REVIEW REQUIRED</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">Select a document from the left to view</div>
          )}
        </div>

        {/* Right Pane - Rules, Flags, History */}
        <div className={`w-full md:w-72 lg:w-[340px] bg-white dark:bg-[#14232c] border-l border-slate-200 dark:border-slate-800 flex-col z-10 ${mobileViewPane === 'right' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex p-2 gap-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#101c24] sticky top-0 z-10">
            <button onClick={() => setRightTab('rules')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${rightTab === 'rules' ? 'bg-white dark:bg-[#1a2c38] shadow-sm text-teal-700 dark:text-teal-300 ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              Rules
            </button>
            <button onClick={() => setRightTab('flags')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex justify-center items-center gap-1.5 ${rightTab === 'flags' ? 'bg-amber-500/15 shadow-sm text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              Flags {app.aiFlags > 0 && <span className="bg-amber-500 text-slate-950 font-black py-0.5 px-1.5 rounded-full text-[10px] shadow-sm">{app.aiFlags}</span>}
            </button>
            <button onClick={() => setRightTab('history')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${rightTab === 'history' ? 'bg-white dark:bg-[#1a2c38] shadow-sm text-teal-700 dark:text-teal-300 ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-[#14232c]">
            {rightTab === 'rules' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Eligibility Evaluation</h3>
                  <Badge variant="gray" className="text-[10px]">Automated</Badge>
                </div>
                <div className="space-y-3">
                  {app.rulesEvaluation?.map((rule, idx) => (
                     <Card key={idx} className="p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#172732] shadow-sm relative overflow-hidden rounded-xl">
                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${rule.passed ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                       <div className="flex items-start gap-3 pl-2">
                         <div className={`mt-0.5 p-1 rounded-md ${rule.passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                           {rule.passed ? (
                             <Check className="w-3.5 h-3.5 font-bold" />
                           ) : (
                             <X className="w-3.5 h-3.5 font-bold" />
                           )}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rule.ruleId.replace('rule_', '').toUpperCase()}</p>
                           <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded">Actual: {String(rule.actual)}</p>
                         </div>
                       </div>
                     </Card>
                  ))}
                  
                  {app.aiFlags > 0 && (
                    <Card className="p-3.5 border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20 shadow-sm relative overflow-hidden mt-6 rounded-xl">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
                      <div className="flex items-start gap-3 pl-2">
                        <div className="mt-0.5 p-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Certificate Issue Date</p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1.5 leading-relaxed">Unable to confidently extract to verify validity rule.</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {rightTab === 'flags' && (
              <div className="space-y-5">
                {app.aiFlags > 0 ? (
                  <div className="p-5 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-[#172732] border border-amber-300/60 dark:border-amber-500/40 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                      <AlertTriangle className="w-24 h-24 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full text-xs font-black tracking-wide mb-4 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> LOW CONFIDENCE
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 leading-snug">
                        Income certificate issue date could not be read reliably.
                      </p>
                      <div className="bg-white dark:bg-[#101c24] border border-slate-200 dark:border-slate-800 p-3 rounded-xl mb-6 shadow-sm">
                        <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Evidence</p>
                        <p className="text-sm font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block font-semibold">OCR confidence 41%</p>
                      </div>
                      <div className="space-y-2.5">
                        <button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-bold py-2.5 rounded-lg transition-colors text-sm" onClick={() => setShowDeficiencyModal(true)}>
                          Raise Deficiency
                        </button>
                        <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-lg transition-colors">
                          Dismiss Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold">All Clear</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">No AI flags detected for this application.</p>
                  </div>
                )}
              </div>
            )}

            {rightTab === 'history' && (
              <div className="space-y-4">
                <StatusTimeline timeline={app.timeline} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Deficiency Modal */}
      {showDeficiencyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#172732] rounded-2xl my-8">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#172732] flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" /> Raise Deficiency
              </h2>
              <button onClick={() => setShowDeficiencyModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 bg-slate-50/50 dark:bg-[#121f28]">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Documents Requiring Attention</label>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {app.documents?.map(doc => (
                    <label key={doc.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors shadow-sm ${selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id) ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#172732] hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id)}
                        onChange={(e) => setSelectedDocs(prev => ({...prev, [doc.id]: e.target.checked}))}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
                      /> 
                      <span className={`font-semibold text-sm ${selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id) ? 'text-amber-900 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'}`}>{doc.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Issue Type</label>
                  <select className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm p-2.5 border bg-white dark:bg-[#172732] text-slate-900 dark:text-slate-100 font-medium">
                    <option>Unreadable / Blurry</option>
                    <option>Missing Document</option>
                    <option>Information Mismatch</option>
                    <option>Expired Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                  <input type="date" className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 p-2.5 border bg-white dark:bg-[#172732] text-slate-900 dark:text-slate-100 font-medium text-sm" defaultValue="2026-09-28" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Remarks to Applicant</label>
                <textarea 
                  rows="4" 
                  className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm p-3 border bg-white dark:bg-[#172732] text-slate-900 dark:text-slate-100 resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">These remarks will be directly visible to the applicant on their dashboard.</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-100/60 dark:bg-[#101c24] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="secondary" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700" onClick={() => setShowDeficiencyModal(false)}>Cancel</Button>
              <button className="bg-amber-600 hover:bg-amber-700 text-white shadow-md font-bold px-6 py-2 rounded-lg text-sm transition-colors" onClick={handleDeficiencySubmit}>Send Query</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
