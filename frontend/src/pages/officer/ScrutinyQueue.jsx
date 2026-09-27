import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, Button, Badge } from '../../components/CommonUI';
import { Search, Filter, AlertTriangle, Clock, ArrowRight, ShieldCheck, Activity, Inbox } from 'lucide-react';

export default function ScrutinyQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueue = async () => {
      const data = await api.getScrutinyQueue();
      setQueue(data);
      setLoading(false);
    };
    fetchQueue();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Activity className="animate-spin text-teal-500 w-8 h-8" /></div>;

  const visibleQueue = queue.filter(app => {
    const matches = `${app.id} ${app.applicantName} ${app.schemeName}`.toLowerCase().includes(search.toLowerCase());
    return matches && (!attentionOnly || app.status === 'Deficiency' || app.aiFlags > 0);
  });
  const stats = [
    { label: 'Assigned to Me', value: queue.length, color: 'from-blue-500 to-blue-700', textColor: 'text-white', icon: ShieldCheck },
    { label: 'Pending Review', value: queue.filter(q => q.status === 'Submitted').length, color: 'from-gray-100 to-gray-50', textColor: 'text-gray-900', border: true, icon: Clock },
    { label: 'Approaching SLA', value: queue.filter(q => q.slaMs > 0).length, color: 'from-orange-50 to-orange-100', textColor: 'text-orange-700', border: true, icon: Clock },
    { label: 'AI Flags', value: queue.filter(q => q.aiFlags > 0).length, color: 'from-red-50 to-red-100', textColor: 'text-red-700', border: true, icon: AlertTriangle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Scrutiny Work Queue</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Review assigned applications and verify AI-extracted data.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`p-5 border-0 overflow-hidden relative transition-transform hover:-translate-y-0.5 duration-200 ${
            idx === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20' : 'bg-white ring-1 ring-gray-200 shadow-sm'
          }`}>
            {idx === 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-blue-100' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-black mt-2 ${idx === 0 ? 'text-white' : stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-white/20' : 'bg-gray-50'}`}>
                <stat.icon className={`w-5 h-5 ${idx === 0 ? 'text-white' : 'text-gray-400'}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-md">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by Application ID or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm bg-white shadow-sm transition-colors"
            />
          </div>
          <Button variant="secondary" aria-pressed={attentionOnly} onClick={() => setAttentionOnly(value => !value)} className="flex items-center shadow-sm shrink-0"><Filter className="w-4 h-4 mr-2" /> {attentionOnly ? 'Show all' : 'Needs attention'}</Button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Application</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scheme</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stage</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Signals</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SLA</th>
                <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {visibleQueue.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer" onClick={() => navigate(`/scrutiny/${app.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{app.id}</span>
                      <span className="text-sm text-gray-500 font-medium">{app.applicantName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded uppercase">{app.schemeId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={app.status === 'Deficiency' ? 'orange' : 'blue'}>{app.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.aiFlags > 0 ? (
                      <span className="inline-flex items-center text-orange-600 text-sm font-bold bg-orange-50 px-2.5 py-1 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> {app.aiFlags} Flag{app.aiFlags > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">No flags</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.slaMs > 0 ? (
                      <span className="inline-flex items-center text-gray-700 text-sm font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> 2h 14m
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button onClick={(e) => { e.stopPropagation(); navigate(`/scrutiny/${app.id}`); }} className="opacity-60 group-hover:opacity-100 transition-opacity shadow-sm text-xs px-3 py-1.5">
                      Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
              {visibleQueue.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No cases currently assigned to you.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {visibleQueue.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(`/scrutiny/${app.id}`)}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{app.id}</span>
                  <Badge variant={app.status === 'Deficiency' ? 'orange' : 'blue'} className="text-[10px]">{app.status}</Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{app.applicantName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded uppercase">{app.schemeId}</span>
                  {app.aiFlags > 0 && (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {app.aiFlags} flag{app.aiFlags > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
            </button>
          ))}
          {queue.length === 0 && (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No cases assigned.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
