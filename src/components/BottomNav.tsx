import { List, ShoppingCart, Utensils } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav({ activeTab, onChangeTab }: { activeTab: string, onChangeTab: (tab: string) => void }) {
  const tabs = [
    { id: 'consumption', label: 'Use', icon: Utensils },
    { id: 'list', label: 'List', icon: List },
    { id: 'restock', label: 'Restock', icon: ShoppingCart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-indigo-500"
            )}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
