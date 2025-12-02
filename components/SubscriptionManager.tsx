
import React, { useMemo } from 'react';
import { Asset, AssetType, AssetStatus } from '../types';
import { CreditCard, Calendar, AlertCircle, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface SubscriptionManagerProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onAdd: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ assets, onEdit, onAdd }) => {
  
  // Filter for Subscriptions and Software
  const subs = useMemo(() => {
    return assets.filter(a => a.type === AssetType.Subscription || a.type === AssetType.Software);
  }, [assets]);

  // Calculations
  const metrics = useMemo(() => {
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let expiringSoonCount = 0;
    const activeSubs = subs.filter(s => s.status === AssetStatus.Active);
    
    activeSubs.forEach(sub => {
      const price = sub.price || 0;
      if (sub.billingCycle === 'Monthly') {
        monthlyTotal += price;
        yearlyTotal += price * 12;
      } else if (sub.billingCycle === 'Yearly') {
        monthlyTotal += price / 12;
        yearlyTotal += price;
      } else if (sub.billingCycle === 'Quarterly') {
        monthlyTotal += price / 3;
        yearlyTotal += price * 4;
      }
    });

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    subs.forEach(sub => {
      if (sub.renewalDate && sub.status === AssetStatus.Active) {
        const renewal = new Date(sub.renewalDate);
        if (renewal >= today && renewal <= thirtyDaysFromNow) {
          expiringSoonCount++;
        }
      }
    });

    return { monthlyTotal, yearlyTotal, activeCount: activeSubs.length, expiringSoonCount };
  }, [subs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Subscription Management</h2>
           <p className="text-slate-500 text-sm">Track recurring software and service expenses</p>
        </div>
        <button 
           onClick={onAdd}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-indigo-200"
        >
           <CreditCard size={16} /> Add Subscription
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Monthly Spend (Est.)</p>
            <h3 className="text-2xl font-bold text-slate-900">${metrics.monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-indigo-50 to-transparent"></div>
          <div className="absolute right-4 top-4 p-2 bg-indigo-100 rounded-full text-indigo-600 z-10">
             <CreditCard size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Annual Spend (Est.)</p>
            <h3 className="text-2xl font-bold text-slate-900">${metrics.yearlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
          <div className="absolute right-4 top-4 p-2 bg-emerald-100 rounded-full text-emerald-600 z-10">
             <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Active Subscriptions</p>
               <h3 className="text-2xl font-bold text-slate-900">{metrics.activeCount}</h3>
             </div>
             <div className="p-2 bg-blue-100 rounded-full text-blue-600">
               <CheckCircle2 size={20} />
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Renewing Soon (30d)</p>
               <h3 className={`text-2xl font-bold ${metrics.expiringSoonCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                 {metrics.expiringSoonCount}
               </h3>
             </div>
             <div className={`p-2 rounded-full ${metrics.expiringSoonCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
               <Clock size={20} />
             </div>
           </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Renewal Date</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.length > 0 ? (
                subs.map((sub) => {
                  const isExpiringSoon = sub.renewalDate && 
                    new Date(sub.renewalDate) > new Date() && 
                    new Date(sub.renewalDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{sub.name}</div>
                        <div className="text-xs text-slate-500">{sub.model}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        ${sub.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {sub.billingCycle || 'One-Time'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                           {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : '-'}
                           {isExpiringSoon && <AlertCircle size={14} />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {sub.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-800'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onEdit(sub)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                     No subscriptions found. Click "Add Subscription" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
