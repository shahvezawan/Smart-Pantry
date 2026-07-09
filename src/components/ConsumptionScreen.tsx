import { useItems } from '../hooks/useItems';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Minus, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConsumptionScreen({ activeGroupId }: { activeGroupId: string | null }) {
  const items = useItems(activeGroupId);
  const inStock = items.filter(item => item.quantity > 0);

  const handleDecrement = async (id: string, current: number) => {
    if (current > 0) {
      await updateDoc(doc(db, 'items', id), { quantity: current - 1 });
    }
  };

  const handleMarkAlmostEmpty = async (id: string) => {
    await updateDoc(doc(db, 'items', id), { needsRestock: true });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
        <header className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center gap-2">
          <UtensilsIcon />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Consumption</h2>
        </header>
        
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-500">Track what you're using. Mark items when they're almost gone.</p>
          {inStock.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No active items in stock.</div>
          ) : (
            <div className="space-y-3">
              {inStock.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <div className="font-semibold text-slate-700">{item.name}</div>
                    <div className="text-sm text-slate-500">Qty: {item.quantity} {item.unit || ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDecrement(item.id, item.quantity)}
                      className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center"
                      title="Use one"
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => handleMarkAlmostEmpty(item.id)}
                      className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1"
                      title="Mark 90% Consumed"
                    >
                      <AlertTriangle className="w-3 h-3" /> 90% USED
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UtensilsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  );
}
