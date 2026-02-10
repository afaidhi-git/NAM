
import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, AssetType, BillingCycle } from '../types';
import { X, RefreshCw, Scan, Calendar, CreditCard } from 'lucide-react';

interface AssetFormProps {
  initialData?: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ initialData, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Asset>>({
    id: '',
    name: '',
    model: '',
    serialNumber: '',
    type: AssetType.Laptop,
    status: AssetStatus.Available,
    price: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    notes: '',
    billingCycle: 'One-Time',
    renewalDate: ''
  });

  const generateNewId = () => {
    // Generate a random ID like AST-123456
    return `AST-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form for new entry with a fresh ID
      setFormData({
        id: generateNewId(),
        name: '',
        model: '',
        serialNumber: '',
        type: AssetType.Laptop,
        status: AssetStatus.Available,
        price: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        notes: '',
        billingCycle: 'One-Time',
        renewalDate: ''
      });
    }
  }, [initialData, isOpen]);

  // Check if current type is subscription-like
  const isSubscription = formData.type === AssetType.Subscription || formData.type === AssetType.Software;

  // Auto-set status to Active for new subscriptions if currently Available
  useEffect(() => {
    if (!initialData && isSubscription && formData.status === AssetStatus.Available) {
        setFormData(prev => ({ ...prev, status: AssetStatus.Active, billingCycle: 'Yearly' }));
    } else if (!initialData && !isSubscription && formData.status === AssetStatus.Active) {
        setFormData(prev => ({ ...prev, status: AssetStatus.Available, billingCycle: 'One-Time' }));
    }
  }, [formData.type, isSubscription]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;
    
    // Construct full asset object
    const assetToSave = formData as Asset;
    onSave(assetToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            {initialData ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asset ID Field */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
            <label className="block text-sm font-semibold text-blue-900 mb-1">Asset Tag ID</label>
            <div className="flex gap-2">
              <input 
                required
                type="text" 
                readOnly={!!initialData} // Lock ID when editing
                className={`w-full px-3 py-2 border border-blue-200 rounded-lg outline-none transition-all font-mono font-medium ${
                  initialData ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'
                }`}
                value={formData.id}
                onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
                placeholder="AST-XXXXXX"
              />
              {!initialData && (
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, id: generateNewId()})}
                  className="p-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Generate New ID"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
            <p className="text-xs text-blue-600/70 mt-1.5 flex items-center gap-1">
              <Scan size={12} />
              {initialData 
                ? "Unique identifier used for scanning (Immutable)" 
                : "Auto-generated. You can also scan a pre-existing tag to populate this."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
              <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder={isSubscription ? "e.g. Adobe Creative Cloud" : "e.g. MacBook Pro 16"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{isSubscription ? 'Plan / Edition' : 'Model'}</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                placeholder={isSubscription ? "e.g. Enterprise Plan" : "e.g. M2 Max"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{isSubscription ? 'License Key / ID' : 'Serial Number'}</label>
              <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                value={formData.serialNumber}
                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                placeholder="e.g. FVFX1234K9"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                 {isSubscription ? 'Start Date' : 'Purchase Date'}
              </label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.purchaseDate}
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
              >
                {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as AssetStatus})}
              >
                {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price / Cost (RM)</label>
              <input 
                type="number" 
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Conditional Subscription Fields */}
          {isSubscription && (
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
               <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1 flex items-center gap-1">
                    <CreditCard size={14} /> Billing Cycle
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    value={formData.billingCycle}
                    onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}
                  >
                    <option value="One-Time">One-Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1 flex items-center gap-1">
                    <Calendar size={14} /> Next Renewal Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.renewalDate || ''}
                    onChange={e => setFormData({...formData, renewalDate: e.target.value})}
                  />
               </div>
            </div>
          )}

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To (Employee/Team)</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.assignedTo}
                onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                placeholder={isSubscription ? "e.g. Marketing Team" : "e.g. John Doe"}
              />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional details..."
              />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors"
            >
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};