import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/CommonUI';
import { Save, Plus, Settings, FileText, CheckSquare, GitMerge, MoveRight, Layers, Eye, Users, ShieldCheck, ChevronRight, Menu, X } from 'lucide-react';

export default function SchemeBuilder() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'general', label: 'General Info', icon: Settings },
    { id: 'form', label: 'Form Layout', icon: FileText },
    { id: 'rules', label: 'Eligibility Rules', icon: CheckSquare },
    { id: 'workflow', label: 'Workflow', icon: GitMerge },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden relative">
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden bg-navy-900 text-white p-4 flex justify-between items-center shrink-0 z-30 shadow-md">
        <h2 className="font-bold text-lg flex items-center gap-2"><Layers className="w-5 h-5 text-teal-400" /> Builder</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-navy-800 rounded-lg transition-colors">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-300 ease-in-out z-20
        w-64 bg-white border-r border-gray-200 flex flex-col shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-gray-100 hidden md:block bg-gray-50/50">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4 text-navy-600" /> Scheme Builder</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">NFST Configuration</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-navy-50 text-navy-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-navy-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto text-navy-400" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button className="w-full bg-navy-900 hover:bg-navy-800 shadow-md font-bold text-sm py-2.5">
            <Save className="w-4 h-4 mr-2" /> Publish Schema
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Configuration: {tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Modify the active schema for National Fellowship for ST.</p>
            </div>
            {activeTab === 'workflow' && (
              <Button variant="secondary" className="shadow-sm font-medium bg-white hover:bg-gray-50 text-sm hidden sm:flex">
                <Plus className="w-4 h-4 mr-1" /> Add Stage
              </Button>
            )}
          </div>

          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border-0 shadow-sm ring-1 ring-gray-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">AI Eligibility Rules</h3>
                  <Button variant="ghost" className="text-teal-600 hover:text-teal-700 bg-teal-50 text-sm font-semibold"><Plus className="w-4 h-4 mr-1" /> New Rule</Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge variant="blue" className="font-bold tracking-wide text-[10px]">rule_income_limit</Badge>
                          <span className="text-xs text-gray-400 font-medium font-mono">ID: inc_842</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-2">Family income must be strictly less than ₹8,00,000</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Derived from Income Certificate (Field: Annual Income)
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                        <Button variant="ghost" className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg"><Settings className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge variant="blue" className="font-bold tracking-wide text-[10px]">rule_st_validity</Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-2">Applicant must belong to recognized Scheduled Tribe</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Matches master list against extracted ST Certificate
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                        <Button variant="ghost" className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg"><Settings className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 mb-8 border-l-4 border-teal-500">
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  The workflow determines the lifecycle of an application. Use this visual editor to define states, who can access them, and automated AI triggers between states.
                </p>
              </div>

              {/* Visual Workflow Mockup */}
              <div className="relative pt-6">
                
                {/* Connecting Lines for desktop */}
                <div className="absolute left-[39px] top-12 bottom-12 w-0.5 bg-gray-200 hidden sm:block"></div>

                <div className="space-y-8 relative">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                    <div className="hidden sm:flex w-20 shrink-0 justify-center relative">
                      <div className="w-10 h-10 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center shadow-md z-10 relative">
                        <span className="text-teal-600 font-bold text-sm">1</span>
                      </div>
                    </div>
                    <Card className="flex-1 p-0 overflow-hidden border-0 ring-1 ring-gray-200 shadow-md hover:shadow-lg transition-shadow group">
                      <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <Eye className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" /> Applicant Submission
                        </h3>
                        <Badge variant="blue" className="text-[10px] uppercase font-bold tracking-wider">Starting State</Badge>
                      </div>
                      <div className="p-5 bg-white">
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">Applicant fills the dynamic form and uploads required documents.</p>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
                          <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Trigger on submit:</span>
                          <div className="mt-2 flex items-center gap-2 text-teal-700 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100 shadow-sm font-medium">
                            <Layers className="w-4 h-4" /> Run AI Extraction & Validation Pipeline
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                    <div className="hidden sm:flex w-20 shrink-0 justify-center relative">
                      <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shadow-md z-10 relative">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                    </div>
                    <Card className="flex-1 p-0 overflow-hidden border-0 ring-1 ring-gray-200 shadow-md hover:shadow-lg transition-shadow group">
                      <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-wrap justify-between items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" /> Scrutiny Desk
                        </h3>
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                          <span className="text-xs text-gray-500 font-bold">Assigned to:</span>
                          <Badge variant="gray" className="text-[10px] bg-gray-100 font-bold">State Nodal Officer</Badge>
                        </div>
                      </div>
                      <div className="p-5 bg-white space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">Human review of AI-flagged documents and rules. Officer can raise deficiency or mark eligible.</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 border px-3 py-2 rounded-lg">
                            <MoveRight className="w-4 h-4 text-orange-500" /> Deficiency Route
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 border px-3 py-2 rounded-lg">
                            <MoveRight className="w-4 h-4 text-emerald-500" /> Eligible Route
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                    <div className="hidden sm:flex w-20 shrink-0 justify-center relative">
                      <div className="w-10 h-10 bg-white border-2 border-purple-500 rounded-full flex items-center justify-center shadow-md z-10 relative">
                        <span className="text-purple-600 font-bold text-sm">3</span>
                      </div>
                    </div>
                    <Card className="flex-1 p-0 overflow-hidden border-0 ring-1 ring-gray-200 shadow-md hover:shadow-lg transition-shadow group">
                      <div className="bg-purple-50/50 p-4 border-b border-purple-100 flex flex-wrap justify-between items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" /> Committee Review
                        </h3>
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                          <span className="text-xs text-gray-500 font-bold">Assigned to:</span>
                          <Badge variant="gray" className="text-[10px] bg-gray-100 font-bold">Selection Committee</Badge>
                        </div>
                      </div>
                      <div className="p-5 bg-white">
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">Merit list generation and final approval of candidates.</p>
                        <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 text-sm flex justify-between items-center">
                          <span className="font-bold text-purple-900 text-xs uppercase tracking-wider">Automated Sorting</span>
                          <span className="text-purple-700 font-medium text-xs bg-white px-2 py-1 rounded shadow-sm border border-purple-100">Sort by: AI Merit Score</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                </div>
              </div>
            </div>
          )}
          
          {(activeTab === 'general' || activeTab === 'form') && (
            <div className="bg-white p-12 text-center rounded-2xl shadow-sm ring-1 ring-gray-200 border-dashed border-2 border-gray-300">
              <p className="text-gray-500 font-medium">Select 'Eligibility Rules' or 'Workflow' to preview the configuration.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
