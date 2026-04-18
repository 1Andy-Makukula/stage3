// KithLy Merchant Layout - Dedicated workspace shell for Merchants

import { Outlet, useNavigate } from 'react-router';
import { Store, LogOut, ArrowLeft, Settings, BarChart, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from '../components/ui/sonner';

export function MerchantLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Shell */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center">
              <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-light text-white tracking-tight">KithLy</h1>
              <p className="text-xs text-slate-500 font-light tracking-widest uppercase">Merchant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* We use active state in Dashboard tabs, so this just marks the workspace */}
          <div className="px-4 py-2 bg-slate-800 text-white rounded-lg font-light flex items-center gap-3">
            <BarChart className="w-4 h-4" strokeWidth={1.5} />
            Workspace
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors font-light text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to Marketplace
          </button>
          
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors font-light text-sm"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-light text-black">Shop Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-muted-foreground">{user?.full_name || 'Merchant'}</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#F97316]" />
            </div>
          </div>
        </header>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
