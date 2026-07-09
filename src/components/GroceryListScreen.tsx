import { useItems } from '../hooks/useItems';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { List, Check, ShoppingCart } from 'lucide-react';

export default function GroceryListScreen({ activeGroupId }: { activeGroupId: string | null }) {
  const items = useItems(activeGroupId);
  
  // Grocery list consists of items that are flagged needsRestock OR have quantity 0
  const groceryList = items.filter(item => item.needsRestock || item.quantity === 0);

  const handleMarkPurchased = async (id: string, currentQty: number) => {
    await updateDoc(doc(db, 'items', id), {
      quantity: currentQty + 1,
      needsRestock: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
        <header className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Smart Grocery List
          </h2>
          <span className="text-xs font-medium text-slate-500">{groceryList.length} Items</span>
        </header>
        
        <div className="p-4 space-y-3">
          {groceryList.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">You're all stocked up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groceryList.map(item => (
                <div key={item.id} className={`p-3 border rounded-xl flex items-center justify-between ${item.quantity === 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{item.name} <span className="text-sm font-normal text-slate-500">({item.unit || 'Pieces'})</span></span>
                    {item.quantity > 0 && item.needsRestock && (
                      <span className="text-xs text-orange-600 font-medium mt-1">
                        90% Consumed Trigger
                      </span>
                    )}
                    {item.quantity === 0 && (
                      <span className="text-xs text-red-600 font-medium mt-1">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleMarkPurchased(item.id, item.quantity)}
                    className={`w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-slate-50 transition-colors shadow-sm ${item.quantity === 0 ? 'border-red-300 text-red-600' : 'border-orange-300 text-orange-600'}`}
                    title="Mark Purchased"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="pt-4">
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">Order All via Instacart</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
