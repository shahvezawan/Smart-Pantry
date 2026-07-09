import { useState } from 'react';
import { useItems } from '../hooks/useItems';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Plus, ShoppingCart } from 'lucide-react';

export default function RestockScreen({ activeGroupId }: { activeGroupId: string | null }) {
  const items = useItems(activeGroupId);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('Pieces');

  const handleAddOrRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !auth.currentUser) return;
    
    const ownerId = activeGroupId || auth.currentUser.uid;
    const isGroup = !!activeGroupId;
    
    // Check if it already exists
    const existing = items.find(i => i.name.toLowerCase() === newItemName.trim().toLowerCase());
    
    if (existing) {
      await updateDoc(doc(db, 'items', existing.id), {
        quantity: existing.quantity + newQuantity,
        unit: newUnit,
        needsRestock: false
      });
    } else {
      await addDoc(collection(db, 'items'), {
        name: newItemName.trim(),
        quantity: newQuantity,
        unit: newUnit,
        ownerId,
        isGroup,
        needsRestock: false
      });
    }
    setNewItemName('');
    setNewQuantity(1);
    setNewUnit('Pieces');
  };

  const handleIncrement = async (id: string, current: number) => {
    await updateDoc(doc(db, 'items', id), { 
      quantity: current + 1,
      needsRestock: false // if we increment, assume it's restocked
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
        <header className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Add Purchase</h2>
        </header>
        
        <div className="p-4">
          <form onSubmit={handleAddOrRestock} className="space-y-4 mb-8">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
              <input 
                type="text" 
                placeholder="e.g. Almond Milk" 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                <input 
                  type="number" 
                  min="0.1"
                  step="any"
                  value={newQuantity}
                  onChange={e => setNewQuantity(Number(e.target.value))}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                <select 
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Lbs">Lbs</option>
                  <option value="Kgs">Kgs</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Packs">Packs</option>
                  <option value="Liters">Liters</option>
                  <option value="Ounces">Ounces</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-3 mt-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Plus className="w-5 h-5" />
              Restock Inventory
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase pb-2">All Items</h3>
            {items.length === 0 ? (
              <div className="text-center py-4 text-slate-500">Your pantry is empty.</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <div className="font-semibold text-slate-700">{item.name}</div>
                    <div className="text-sm text-slate-500">Stock: {item.quantity} {item.unit || ''}</div>
                  </div>
                  <button 
                    onClick={() => handleIncrement(item.id, item.quantity)}
                    className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
