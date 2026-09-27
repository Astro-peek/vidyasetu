import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/CommonUI';
import { Users, Check, X, Clock, Award, ChevronLeft, BarChart3 } from 'lucide-react';
import { api } from '../../services/api';

export default function CommitteeWorkspace() {
  const [selectedScheme, setSelectedScheme] = useState('nfst');
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getApplications({ status: 'Shortlisted' })
      .then(data => { if (mounted) setApplications(data || []); })
      .catch(err => console.error('Failed to load applications:', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const shortlisted = applications.filter(a => a.status === 'Shortlisted' || a.schemeId === selectedScheme);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading shortlisted applications...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Committee Workspace</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Review eligible candidates and record final selection decisions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scheme</label>
          <select 
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="border-0 rounded-md text-sm font-semibold text-gray-900 bg-transparent focus:ring-0 p-0 pr-6 cursor-pointer"
          >
            <option value="nfst">National Fellowship (NFST)</option>
            <option value="nos">National Overseas (NOS)</option>
          </select>
        </div>
      </div>

      {/* Mobile: Show list or detail */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-14rem)]">
        
        {/* Candidate List */}
        <Card className={`lg:w-1/2 flex flex-col overflow-hidden border-0 ring-1 ring-gray-200 shadow-md ${selectedApp ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              Eligible Shortlist
            </h2>
            <Badge variant="purple">{shortlisted.length} Candidates</Badge>
          </div>
          <div className="overflow-y-auto flex-1">
            {shortlisted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Award className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No shortlisted candidates yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {shortlisted.map((app, idx) => (
                  <button
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-all ${
                      selectedApp?.id === app.id 
                        ? 'bg-purple-50 border-l-4 border-l-purple-500' 
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{app.applicantName}</div>
                        <div className="text-xs text-gray-500 font-medium">{app.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-lg font-black text-purple-600">{app.committeeScores?.total || 92}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Merit</div>
                      </div>
                      <Badge variant="yellow" className="text-[10px]">Pending</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Review Panel */}
        {selectedApp ? (
          <Card className="lg:w-1/2 flex flex-col overflow-hidden border-0 shadow-lg ring-1 ring-purple-200 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-700"></div>
            
            {/* Mobile back button */}
            <button 
              onClick={() => setSelectedApp(null)} 
              className="lg:hidden flex items-center gap-2 px-5 pt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              <ChevronLeft className="w-4 h-4" /> Back to list
            </button>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{selectedApp.applicantName}</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">{selectedApp.id}</p>
                </div>
                <div className="text-left sm:text-right bg-purple-50 px-5 py-3 rounded-xl border border-purple-100">
                  <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">Merit Score</div>
                  <div className="text-4xl font-black text-purple-600 mt-1">{selectedApp.committeeScores?.total || 92}</div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Score Breakdown
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Academic Score', max: 50, value: selectedApp.committeeScores?.academicScore || 45, color: 'bg-blue-500' },
                      { label: 'Research Experience', max: 20, value: selectedApp.committeeScores?.researchExperience || 20, color: 'bg-indigo-500' },
                      { label: 'Interview', max: 30, value: selectedApp.committeeScores?.interview || 24, color: 'bg-purple-500' },
                    ].map(score => (
                      <div key={score.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-gray-700">{score.label}</span>
                          <span className="font-black text-gray-900">{score.value}<span className="text-gray-400 font-medium">/{score.max}</span></span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${score.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${(score.value / score.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <span className="font-bold text-emerald-800">PVTG Preference Bonus</span>
                      <span className="font-black text-emerald-600 text-lg">+{selectedApp.committeeScores?.preference || 3}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Committee Remarks</h3>
                  <textarea 
                    className="w-full border border-gray-200 p-4 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none transition-colors text-sm" 
                    rows="4" 
                    placeholder="Enter final remarks justifying the selection decision..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3 shrink-0">
              <Button variant="danger" className="flex items-center shadow-sm"><X className="w-4 h-4 mr-1.5" /> Reject</Button>
              <Button variant="secondary" className="flex items-center shadow-sm"><Clock className="w-4 h-4 mr-1.5" /> Hold</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 flex items-center shadow-md font-bold px-6" onClick={() => {
                alert("Final decision recorded. Applicant has been selected.");
                setSelectedApp(null);
              }}>
                <Check className="w-4 h-4 mr-1.5" /> Approve Selection
              </Button>
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">Select a candidate</p>
              <p className="text-sm text-gray-400 mt-1">to record final selection decision</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
