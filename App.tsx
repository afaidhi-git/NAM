
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Box, MessageSquare, Settings, Bell, Scan, CreditCard, FileText, PlusCircle, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetForm } from './components/AssetForm';
import { AIChat } from './components/AIChat';
import { QRScanner } from './components/QRScanner';
import { AssetQRModal } from './components/AssetQRModal';
import { SubscriptionManager } from './components/SubscriptionManager';
import { PDFEditor } from './components/PDFEditor';
import { Asset, ViewState, AssetType, DocumentTemplate } from './types';
import { INITIAL_ASSETS, INITIAL_DOCUMENTS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  
  // Asset State
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('nexus_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  // Document State
  const [documents, setDocuments] = useState<DocumentTemplate[]>(() => {
    const saved = localStorage.getItem('nexus_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null); 
  
  // Persist assets to local storage
  useEffect(() => {
    localStorage.setItem('nexus_assets', JSON.stringify(assets));
  }, [assets]);

  // Persist documents to local storage
  useEffect(() => {
    localStorage.setItem('nexus_documents', JSON.stringify(documents));
  }, [documents]);

  // --- Asset Handlers ---
  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };
  
  const handleAddSubscription = () => {
    setEditingAsset({
       id: '',
       name: '',
       model: '',
       serialNumber: '',
       type: AssetType.Subscription,
       status: 'Active' as any,
       purchaseDate: new Date().toISOString().split('T')[0],
       price: 0,
       billingCycle: 'Yearly'
    } as Asset);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset && editingAsset.id) {
      setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
    } else {
      setAssets(prev => [asset, ...prev]);
    }
  };

  // --- Scanner Handler ---
  const handleScanSuccess = (decodedText: string) => {
    const foundAsset = assets.find(a => a.id === decodedText || a.serialNumber === decodedText);
    
    if (foundAsset) {
      setIsScannerOpen(false);
      setTimeout(() => {
        handleEditAsset(foundAsset);
      }, 300);
    } else {
      alert(`Asset not found with ID/Serial: ${decodedText}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nexus</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-slate-800'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveView('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'inventory' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-slate-800'}`}
            >
              <Box size={20} />
              <span>Inventory</span>
            </button>
            <button 
              onClick={() => setActiveView('subscriptions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'subscriptions' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-slate-800'}`}
            >
              <CreditCard size={20} />
              <span>Subscriptions</span>
            </button>
            <button 
              onClick={() => setActiveView('pdf-editor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'pdf-editor' ? 'bg-blue-600/10 text-blue-400 font-medium' : 'hover:bg-slate-800'}`}
            >
              <FileText size={20} />
              <span>PDF Editor</span>
            </button>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300"
            >
              <Scan size={20} />
              <span>Scan Asset</span>
            </button>
            <button 
              onClick={() => setActiveView('ai-assistant')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'ai-assistant' ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'hover:bg-slate-800'}`}
            >
              <MessageSquare size={20} />
              <span className="flex-1 text-left">AI Assistant</span>
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] rounded-full">New</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
             <Settings size={20} />
             <span>Settings</span>
          </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
             <LogOut size={20} />
             <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-4 md:hidden">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Box size={16} />
             </div>
             <span className="font-bold text-slate-900">Nexus</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {activeView.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsScannerOpen(true)}
               className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
             >
               <Scan size={24} />
             </button>

             <div className="relative">
                <Bell size={20} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm ring-4 ring-slate-50">
               JS
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
             {activeView === 'dashboard' && <Dashboard assets={assets} />}
             {activeView === 'inventory' && (
               <AssetList 
                  assets={assets} 
                  onDelete={handleDeleteAsset} 
                  onEdit={handleEditAsset} 
                  onAdd={handleAddAsset}
                  onShowQR={setQrAsset}
               />
             )}
             {activeView === 'subscriptions' && (
               <SubscriptionManager 
                  assets={assets}
                  onEdit={handleEditAsset}
                  onAdd={handleAddSubscription}
               />
             )}
             {activeView === 'pdf-editor' && (
               <PDFEditor 
                 initialDocuments={documents}
                 onSave={setDocuments}
               />
             )}
             {activeView === 'ai-assistant' && <AIChat assets={assets} />}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center z-40 active:scale-95 transition-transform"
        onClick={() => {
          if (activeView === 'subscriptions') handleAddSubscription();
          else handleAddAsset();
        }}
      >
        <PlusCircle size={28} />
      </button>

      {/* Modals */}
      <AssetForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveAsset}
        initialData={editingAsset}
      />
      
      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={handleScanSuccess} 
      />

      <AssetQRModal 
        isOpen={!!qrAsset} 
        onClose={() => setQrAsset(null)} 
        asset={qrAsset} 
      />
    </div>
  );
};

export default App;
