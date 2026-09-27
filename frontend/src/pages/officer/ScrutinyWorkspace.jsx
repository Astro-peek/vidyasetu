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
    <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap gap-4 justify-between items-center shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-2 hover:bg-gray-100 hidden md:flex" onClick={() => navigate('/scrutiny')}>
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">{app.id}</h1>
              <Badge variant="blue" className="hidden sm:inline-flex">Under Scrutiny</Badge>
            </div>
            <p className="text-xs text-gray-500 font-medium">{app.applicantName} • <span className="uppercase text-teal-600">{app.schemeId}</span></p>
          </div>
        </div>
        
        {/* Mobile Pane Switcher */}
        <div className="flex md:hidden bg-gray-100 p-1 rounded-lg w-full mb-2">
          <button onClick={() => setMobileViewPane('left')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${mobileViewPane === 'left' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Summary</button>
          <button onClick={() => setMobileViewPane('center')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${mobileViewPane === 'center' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Document</button>
          <button onClick={() => setMobileViewPane('right')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${mobileViewPane === 'right' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Analysis</button>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button variant="secondary" onClick={() => handleAction('deficiency')} className="flex-1 md:flex-none text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-colors shadow-sm text-sm">Raise Deficiency</Button>
          <Button variant="danger" onClick={() => handleAction('Mark Ineligible')} className="flex-1 md:flex-none text-sm shadow-sm">Mark Ineligible</Button>
          <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-sm text-sm" onClick={() => handleAction('Mark Eligible')}>Mark Eligible</Button>
        </div>
      </div>

      {/* Workspace Three Panes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Pane - Summary & Documents */}
        <div className={`w-full md:w-72 lg:w-80 bg-white border-r border-gray-200 overflow-y-auto flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${mobileViewPane === 'left' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Applicant Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-500">Name</span><span className="font-semibold text-gray-900">{app.applicantName}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Scheme</span><span className="font-semibold text-gray-900 uppercase">{app.schemeId}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Submitted</span><span className="font-medium text-gray-700">{new Date(app.submittedDate).toLocaleDateString()}</span></div>
            </div>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 pt-2">Documents List</h2>
            <div className="space-y-1.5">
              {app.documents?.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => { setActiveDoc(doc); setMobileViewPane('center'); }}
                  className={`w-full text-left px-3 py-3 rounded-xl border text-sm flex items-center justify-between transition-all ${
                    activeDoc?.id === doc.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-1.5 rounded-lg shrink-0 ${doc.aiCheck === 'Issue Found' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {doc.aiCheck === 'Issue Found' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <FileCheck className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`truncate font-medium ${activeDoc?.id === doc.id ? 'text-blue-900' : 'text-gray-700'}`}>{doc.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Pane - Document Viewer */}
        <div className={`flex-1 flex-col bg-gray-100/80 overflow-hidden relative ${mobileViewPane === 'center' ? 'flex' : 'hidden md:flex'}`}>
          {activeDoc ? (
            <>
              {/* Document Toolbar */}
              <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex justify-between items-center shadow-sm z-10">
                <span className="font-semibold text-sm text-gray-800">{activeDoc.name}</span>
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white rounded"><ZoomOut className="w-4 h-4 text-gray-600" /></Button>
                  <span className="text-xs font-bold text-gray-600 w-12 text-center">100%</span>
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white rounded"><ZoomIn className="w-4 h-4 text-gray-600" /></Button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <Button variant="ghost" className="p-1.5 h-auto w-auto hover:bg-white rounded"><RotateCw className="w-4 h-4 text-gray-600" /></Button>
                </div>
              </div>

              {/* Document Image Placeholder */}
              <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="bg-white w-full max-w-3xl min-h-[500px] md:min-h-[700px] shadow-xl rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-400 relative z-10 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-500">Document preview for <span className="text-gray-700">{activeDoc.name}</span></p>
                  <p className="text-xs text-gray-400 mt-2">Use toolbar to zoom and pan.</p>
                </div>
              </div>

              {/* Extraction comparison panel */}
              {activeDoc.extracted && (
                <div className="max-h-72 bg-white border-t border-gray-200 overflow-y-auto shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                  <div className="px-5 py-3 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span> AI Extraction vs Application
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/50">
                    {Object.entries(activeDoc.extracted).map(([field, data]) => {
                      const isLowConfidence = data.confidence < 80;
                      const appValue = app.formData?.[field];
                      const isMatch = appValue && String(appValue) === String(data.value);
                      
                      return (
                        <div key={field} className={`p-4 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${isLowConfidence ? 'ring-1 ring-orange-400 border-orange-200' : 'border-gray-200'}`}>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                          
                          <div className="space-y-2 text-sm">
                            {appValue && (
                              <div className="flex justify-between items-baseline gap-2 pb-2 border-b border-gray-100">
                                <span className="text-gray-500 text-xs shrink-0">Application</span>
                                <span className="font-bold text-gray-900 text-right truncate">{appValue}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-baseline gap-2 pt-1">
                              <span className="text-gray-500 text-xs shrink-0">Extracted</span>
                              <span className={`font-bold text-right truncate ${isLowConfidence ? 'text-orange-700' : 'text-gray-900'}`}>{data.value}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className={`text-xs font-black ${isLowConfidence ? 'text-orange-600' : 'text-emerald-600'}`}>
                              {data.confidence}% CONFIDENCE
                            </span>
                            {isMatch && !isLowConfidence && <Badge variant="green" className="text-[10px] px-1.5 py-0">MATCH</Badge>}
                            {isLowConfidence && <Badge variant="orange" className="text-[10px] px-1.5 py-0 animate-pulse">REVIEW REQUIRED</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Select a document from the left to view</div>
          )}
        </div>

        {/* Right Pane - Rules, Flags, History */}
        <div className={`w-full md:w-72 lg:w-[340px] bg-white border-l border-gray-200 flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] ${mobileViewPane === 'right' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
            <button onClick={() => setRightTab('rules')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${rightTab === 'rules' ? 'bg-white shadow-sm text-teal-700 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
              Rules
            </button>
            <button onClick={() => setRightTab('flags')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors flex justify-center items-center gap-1.5 ${rightTab === 'flags' ? 'bg-orange-50 shadow-sm text-orange-700 ring-1 ring-orange-200' : 'text-gray-500 hover:bg-gray-100'}`}>
              Flags {app.aiFlags > 0 && <span className="bg-orange-500 text-white py-0.5 px-1.5 rounded-full text-[10px] shadow-sm">{app.aiFlags}</span>}
            </button>
            <button onClick={() => setRightTab('history')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${rightTab === 'history' ? 'bg-white shadow-sm text-teal-700 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
              History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {rightTab === 'rules' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Eligibility Evaluation</h3>
                  <Badge variant="gray" className="text-[10px]">Automated</Badge>
                </div>
                <div className="space-y-3">
                  {app.rulesEvaluation?.map((rule, idx) => (
                     <Card key={idx} className="p-3 border-0 ring-1 ring-gray-200 shadow-sm relative overflow-hidden">
                       <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                       <div className="flex items-start gap-3 pl-2">
                         <div className={`mt-0.5 p-1 rounded-md ${rule.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                           {rule.passed ? (
                             <Check className="w-3.5 h-3.5 text-green-600 font-bold" />
                           ) : (
                             <X className="w-3.5 h-3.5 text-red-600 font-bold" />
                           )}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-gray-900">{rule.ruleId.replace('rule_', '').toUpperCase()}</p>
                           <p className="text-xs text-gray-600 mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded">Actual: {String(rule.actual)}</p>
                         </div>
                       </div>
                     </Card>
                  ))}
                  
                  {app.aiFlags > 0 && (
                    <Card className="p-3 border-0 ring-1 ring-orange-200 bg-orange-50/50 shadow-sm relative overflow-hidden mt-6">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                      <div className="flex items-start gap-3 pl-2">
                        <div className="mt-0.5 p-1 bg-orange-100 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-orange-900">Certificate Issue Date</p>
                          <p className="text-xs text-orange-800 mt-1.5 leading-relaxed">Unable to confidently extract to verify validity rule.</p>
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
                  <div className="p-5 bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                      <AlertTriangle className="w-24 h-24 text-orange-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-xs font-black tracking-wide mb-4 border border-orange-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> LOW CONFIDENCE
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-3 leading-snug">
                        Income certificate issue date could not be read reliably.
                      </p>
                      <div className="bg-white border border-gray-100 p-3 rounded-lg mb-6 shadow-sm">
                        <p className="text-[11px] uppercase font-bold text-gray-400 mb-1">Evidence</p>
                        <p className="text-sm font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">OCR confidence 41%</p>
                      </div>
                      <div className="space-y-2.5">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-semibold py-2.5" onClick={() => setShowDeficiencyModal(true)}>
                          Raise Deficiency
                        </Button>
                        <Button variant="ghost" className="w-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-sm font-semibold">
                          Dismiss Flag
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-gray-900 font-medium">All Clear</p>
                    <p className="text-gray-500 text-sm mt-1">No AI flags detected for this application.</p>
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl overflow-hidden border-0 my-8">
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" /> Raise Deficiency
              </h2>
              <button onClick={() => setShowDeficiencyModal(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 bg-gray-50/30">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Documents Requiring Attention</label>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {app.documents?.map(doc => (
                    <label key={doc.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors shadow-sm ${selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id) ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id)}
                        onChange={(e) => setSelectedDocs(prev => ({...prev, [doc.id]: e.target.checked}))}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      /> 
                      <span className={`font-semibold text-sm ${selectedDocs[doc.id] || (Object.keys(selectedDocs).length === 0 && activeDoc?.id === doc.id) ? 'text-orange-900' : 'text-gray-700'}`}>{doc.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Type</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2.5 border bg-white font-medium">
                    <option>Unreadable / Blurry</option>
                    <option>Missing Document</option>
                    <option>Information Mismatch</option>
                    <option>Expired Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Due Date</label>
                  <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2.5 border bg-white font-medium text-sm" defaultValue="2026-09-28" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Remarks to Applicant</label>
                <textarea 
                  rows="4" 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-3 border bg-white resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">These remarks will be directly visible to the applicant on their dashboard.</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-100/50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" className="bg-white" onClick={() => setShowDeficiencyModal(false)}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700 shadow-md font-bold px-6" onClick={handleDeficiencySubmit}>Send Query</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
