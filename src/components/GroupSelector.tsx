import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Users, User, Plus } from 'lucide-react';
import { Group } from '../types';

export default function GroupSelector({ activeGroupId, onSelectGroup }: { activeGroupId: string | null, onSelectGroup: (id: string | null) => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'groups'), where('members', 'array-contains', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
    return unsub;
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !auth.currentUser) return;
    await addDoc(collection(db, 'groups'), {
      name: newGroupName,
      members: [auth.currentUser.uid]
    });
    setNewGroupName('');
  };

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim() || !auth.currentUser) return;
    const groupRef = doc(db, 'groups', joinGroupId);
    await updateDoc(groupRef, {
      members: arrayUnion(auth.currentUser.uid)
    });
    setJoinGroupId('');
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-sm font-semibold text-slate-800 shadow-sm transition-colors"
      >
        {activeGroupId ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
        {activeGroup ? activeGroup.name : 'Personal'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2">
          <div className="mb-2">
            <button 
              onClick={() => { onSelectGroup(null); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!activeGroupId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Personal
            </button>
            {groups.map(g => (
              <button 
                key={g.id}
                onClick={() => { onSelectGroup(g.id); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeGroupId === g.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              >
                <Users className="w-4 h-4" /> {g.name}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-2 space-y-2">
            <div className="flex gap-2 px-1">
              <input 
                type="text" 
                placeholder="New group name..." 
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <button onClick={handleCreateGroup} className="bg-blue-600 text-white p-1 rounded"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 px-1">
              <input 
                type="text" 
                placeholder="Join group ID..." 
                value={joinGroupId}
                onChange={e => setJoinGroupId(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <button onClick={handleJoinGroup} className="bg-green-600 text-white p-1 rounded"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
