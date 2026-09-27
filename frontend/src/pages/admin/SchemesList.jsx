import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, Button, Badge } from '../../components/CommonUI';
import { Plus, Edit2, Copy, Eye, Activity, FileText, ArrowRight } from 'lucide-react';

export default function SchemesList() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemes = async () => {
      const data = await api.getSchemes();
      setSchemes(data);
      setLoading(false);
    };
    fetchSchemes();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Activity className="animate-spin text-teal-500 w-8 h-8" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Scheme Management</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Configure and manage MoTA scholarship schemes.</p>
        </div>
        <Button onClick={() => navigate('/admin/schemes/new/builder')} className="flex items-center shadow-md font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Scheme
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden border-0 ring-1 ring-gray-200 shadow-md hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scheme</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applications</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {schemes.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy-50 rounded-lg">
                        <FileText className="w-4 h-4 text-navy-600" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-900">{scheme.shortName}</span>
                        <p className="text-xs text-gray-500 font-medium">{scheme.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{scheme.version}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={scheme.status === 'Published' ? 'green' : 'gray'}>{scheme.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{scheme.applicationsCount?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{new Date(scheme.lastUpdated).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => navigate(`/admin/schemes/${scheme.id}/builder`)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Clone"><Copy className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {schemes.map((scheme) => (
          <Card key={scheme.id} className="p-5 border-0 ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy-50 rounded-lg">
                  <FileText className="w-4 h-4 text-navy-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{scheme.shortName}</h3>
                  <p className="text-xs text-gray-500">{scheme.name}</p>
                </div>
              </div>
              <Badge variant={scheme.status === 'Published' ? 'green' : 'gray'} className="text-[10px]">{scheme.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
              <div className="flex gap-4">
                <span>v{scheme.version}</span>
                <span>{scheme.applicationsCount?.toLocaleString() || 0} apps</span>
              </div>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => navigate(`/admin/schemes/${scheme.id}/builder`)}>
                Edit <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
