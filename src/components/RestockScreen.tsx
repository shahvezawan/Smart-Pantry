import { useState, type FormEvent } from 'react';
import { useItems } from '../hooks/useItems';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Check, Pencil, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Item } from '../types';

const units = ['Pieces', 'Lbs', 'Kgs', 'Cartons', 'Packs', 'Liters', 'Ounces', 'Bags'];

type ItemDraft = Pick<Item, 'name' | 'quantity'> & { unit: string };

export default function RestockScreen({ activeGroupId }: { activeGroupId: string | null }) {
  const items = useItems(activeGroupId);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('Pieces');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft>({ name: '', quantity: 1, unit: 'Pieces' });

  const handleAddOrRestock = async (e: FormEvent) => {
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

  const startEditing = (item: Item) => {
    setEditingId(item.id);
    setItemDraft({ name: item.name, quantity: item.quantity, unit: item.unit || 'Pieces' });
  };

  const handleSaveItem = async (e: FormEvent, id: string) => {
    e.preventDefault();
    const name = itemDraft.name.trim();
    if (!name || itemDraft.quantity < 0) return;

    await updateDoc(doc(db, 'items', id), {
      name,
      quantity: itemDraft.quantity,
      unit: itemDraft.unit,
      needsRestock: itemDraft.quantity === 0
    });
    setEditingId(null);
  };

  const handleDeleteItem = async (item: Item) => {
    if (!window.confirm(`Delete ${item.name} from your pantry? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'items', item.id));
    if (editingId === item.id) setEditingId(null);
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
                  {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
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
              items.map(item => editingId === item.id ? (
                <form key={item.id} onSubmit={e => handleSaveItem(e, item.id)} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_7rem] gap-2">
                    <input
                      aria-label="Item name"
                      value={itemDraft.name}
                      onChange={e => setItemDraft({ ...itemDraft, name: e.target.value })}
                      className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      autoFocus
                    />
                    <input
                      aria-label="Quantity"
                      type="number"
                      min="0"
                      step="any"
                      value={itemDraft.quantity}
                      onChange={e => setItemDraft({ ...itemDraft, quantity: Number(e.target.value) })}
                      className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <select
                      aria-label="Unit"
                      value={itemDraft.unit}
                      onChange={e => setItemDraft({ ...itemDraft, unit: e.target.value })}
                      className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button type="submit" className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </form>
              ) : (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700 truncate">{item.name}</div>
                    <div className="text-sm text-slate-500">Stock: {item.quantity} {item.unit || ''}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleIncrement(item.id, item.quantity)} className="px-2.5 py-2 text-xs font-bold border border-slate-200 bg-white rounded-lg hover:bg-slate-100 flex items-center gap-1" title="Restock one">
                      <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Restock</span>
                    </button>
                    <button onClick={() => startEditing(item)} className="p-2 text-indigo-600 border border-indigo-200 bg-white rounded-lg hover:bg-indigo-50" title={`Edit ${item.name}`} aria-label={`Edit ${item.name}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteItem(item)} className="p-2 text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50" title={`Delete ${item.name}`} aria-label={`Delete ${item.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
