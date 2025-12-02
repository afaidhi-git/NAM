import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Asset, AssetStatus, AssetType } from '../types';
import { Laptop, Monitor, AlertCircle, CheckCircle2, DollarSign, Layers } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  
  // Calculate Stats
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.price, 0);
  const assignedCount = assets.filter(a => a.status === AssetStatus.Assigned).length;
  const availableCount = assets.filter(a => a.status === AssetStatus.Available).length;
  const repairCount = assets.filter(a => a.status === AssetStatus.InRepair).length;

  // Prepare Chart Data
  const statusData = Object.values(AssetStatus).map(status => ({
    name: status,
    value: assets.filter(a => a.status === status).length
  })).filter(d => d.value > 0);

  const typeData = Object.values(AssetType).map(type => ({
    name: type,
    value: assets.filter(a => a.type === type).length
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Assets</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalAssets}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Value</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ${totalValue.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Available</p>
            <h3 className="text-2xl font-bold text-slate-900">{availableCount}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">In Repair</p>
            <h3 className="text-2xl font-bold text-slate-900">{repairCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Mini-Table (Mock) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Recent Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.filter(a => a.assignedTo).slice(0, 3).map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-medium text-slate-900">{asset.name}</td>
                  <td className="px-6 py-3">{asset.assignedTo}</td>
                  <td className="px-6 py-3">{asset.purchaseDate}</td>
                  <td className="px-6 py-3 text-blue-600">Assigned</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};