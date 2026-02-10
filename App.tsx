import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Box, Settings, Bell, Scan, CreditCard, PlusCircle, LogOut, Loader2, X, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetForm } from './components/AssetForm';
import { QRScanner } from './components/QRScanner';
import { AssetQRModal } from './components/AssetQRModal';
import { SubscriptionManager } from './components/SubscriptionManager';
import { Auth } from './components/Auth';
import { Asset, ViewState, AssetType, AssetStatus, User, AuthSession } from './types';
import { db } from './services/db';
import { supabase, isSupabaseConfigured } from './services/supabaseService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info';
  date: string;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  
  // Auth State
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null); 
  
  // --- Initialization & Auth Management ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase configuration is missing. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.");
      setAuthLoading(false);
      setDataLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setAuthLoading(false);
    }).catch(err => {
      console.error("Auth session error", err);
      setError("Failed to initialize authentication session.");
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load data from DB on successful authentication
  const loadData = async () => {
    if (!session) return;
    try {
      setDataLoading(true);
      setError(null);
      const loadedAssets = await db.getAssets();
      setAssets(loadedAssets);
      checkNotifications(loadedAssets);
    } catch (err: any) {
      console.error("Failed to load data", err);
      setError(err.message || "Unable to connect to database. Please check your internet connection.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    } else {
      setAssets([]); 
      setNotifications([]);
      if (!authLoading) setDataLoading(false);
    }
  }, [session, authLoading]);

  // Check for alerts (Subscription renewals)
  const checkNotifications = (currentAssets: Asset[]) => {
    const alerts: Notification[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    currentAssets.forEach(asset => {
      if ((asset.type === AssetType.Subscription || asset.type === AssetType.Software) && 
          asset.status === AssetStatus.Active && 
          asset.renewalDate) {
        
        const renewalDate = new Date(asset.renewalDate);
        if (renewalDate >= today && renewalDate <= thirtyDaysFromNow) {
          const diffTime = Math.abs(renewalDate.getTime() - today.getTime());
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          alerts.push({
            id: `renew-${asset.id}`,
            title: 'Subscription Renewing Soon',
            message: `${asset.name} renews on ${renewalDate.toLocaleDateString()} (${daysLeft} days left).`,
            type: 'warning',
            date: new Date().toISOString()
          });
        }
      }
    });

    setNotifications(alerts);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setAssets([]);
    setNotifications([]);
    setActiveView('dashboard');
  };

  // --- Render Logic ---

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Initializing Nexus...</p>
      </div>
    );
  }

  // Handle configuration error screen
  if (!isSupabaseConfigured && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Nexus cannot connect to its database. The Supabase URL and API Key are missing from your environment.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-left text-xs font-mono text-slate-600 mb-6 overflow-x-auto">
            VITE_SUPABASE_URL=missing<br/>
            VITE_SUPABASE_ANON_KEY=missing
          </div>
          <p className="text-sm text-slate-400">
            Please check your <code>.env</code> file or VPS environment settings and restart the build.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';

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
              onClick={() => setIsScannerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300"
            >
              <Scan size={20} />
              <span>Scan Asset</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400"
           >
             <LogOut size={20} />
             <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-30">
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
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-slate-100">
                            {notifications.map((note) => (
                              <div key={note.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex gap-3">
                                  <div className={`mt-0.5 p-1.5 rounded-full h-fit flex-shrink-0 ${note.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                     <AlertTriangle size={14} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-900">{note.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{note.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-400 italic text-sm">No new notifications</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
             </div>

             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
               {userInitials}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
             {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-500" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                  <button onClick={loadData} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                    <RefreshCw size={18} />
                  </button>
                </div>
             )}

             {dataLoading ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                 <Loader2 size={32} className="animate-spin text-blue-600" />
                 <p className="text-sm font-medium">Synchronizing data...</p>
               </div>
             ) : (
               <>
                 {activeView === 'dashboard' && <Dashboard assets={assets} />}
                 {activeView === 'inventory' && (
                   <AssetList 
                      assets={assets} 
                      onDelete={async (id) => {
                         if (confirm('Delete asset?')) {
                            await db.deleteAsset(id);
                            loadData();
                         }
                      }} 
                      onEdit={(asset) => { setEditingAsset(asset); setIsFormOpen(true); }} 
                      onAdd={() => { setEditingAsset(null); setIsFormOpen(true); }}
                      onShowQR={setQrAsset}
                   />
                 )}
                 {activeView === 'subscriptions' && (
                   <SubscriptionManager 
                      assets={assets}
                      onEdit={(asset) => { setEditingAsset(asset); setIsFormOpen(true); }}
                      onAdd={() => {
                        setEditingAsset({
                          id: '', name: '', model: '', serialNumber: '', type: AssetType.Subscription,
                          status: 'Active' as any, purchaseDate: new Date().toISOString().split('T')[0], price: 0
                        } as Asset);
                        setIsFormOpen(true);
                      }}
                   />
                 )}
               </>
             )}
          </div>
        </div>
      </main>

      <AssetForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={async (asset) => { await db.saveAsset(asset); loadData(); }}
        initialData={editingAsset}
      />
      
      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={(id) => {
          const found = assets.find(a => a.id === id || a.serialNumber === id);
          if (found) { setIsScannerOpen(false); setEditingAsset(found); setIsFormOpen(true); }
          else alert('Asset not found');
        }} 
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