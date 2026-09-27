import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/CommonUI';
import { Users, CheckSquare, AlertTriangle, Award, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getDashboardStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="flex items-center justify-center min-h-[50vh]"><Activity className="animate-spin text-teal-500 w-8 h-8" /></div>;

  const stageData = [
    { name: 'Applied', value: 4820 },
    { name: 'Pre-check', value: 3150 },
    { name: 'Scrutiny', value: 2030 },
    { name: 'Eligible', value: 1500 },
    { name: 'Selected', value: 750 },
  ];

  const schemeData = [
    { name: 'NFST', value: 65 },
    { name: 'NOS', value: 35 }
  ];
  const COLORS = ['#0d9488', '#6366f1'];

  const statCards = [
    { label: 'Applications Received', value: stats.received, icon: Users, gradient: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/20' },
    { label: 'Pre-check Clear', value: stats.preCheckClear, icon: CheckSquare, gradient: 'from-teal-500 to-teal-700', shadow: 'shadow-teal-500/20' },
    { label: 'Attention Required', value: stats.attentionRequired, icon: AlertTriangle, gradient: 'from-orange-500 to-orange-700', shadow: 'shadow-orange-500/20' },
    { label: 'Selected', value: stats.selected, icon: Award, gradient: 'from-emerald-500 to-emerald-700', shadow: 'shadow-emerald-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Administration Portal</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Ministry of Tribal Affairs — Vidya Setu Overview</p>
        </div>
        <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live Demo Data
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx} className={`p-5 sm:p-6 border-0 bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} overflow-hidden relative transition-transform hover:-translate-y-1 duration-300`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black mt-2">{stat.value.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl hidden sm:block">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 border-0 ring-1 ring-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" /> Applications by Stage
            </h3>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(20,184,166,0.05)'}} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="url(#tealGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-0 border-0 ring-1 ring-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-bold text-gray-900">Scheme Distribution</h3>
          </div>
          <div className="p-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {schemeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {schemeData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-sm font-bold text-gray-700">{entry.name}</span>
                  <span className="text-sm text-gray-400 font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
