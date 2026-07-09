/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import BottomNav from './components/BottomNav';
import RestockScreen from './components/RestockScreen';
import ConsumptionScreen from './components/ConsumptionScreen';
import GroceryListScreen from './components/GroceryListScreen';
import GroupSelector from './components/GroupSelector';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consumption'); // consumption, restock, list
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">Loading...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart Pantry</h1>
        <div className="flex items-center gap-3">
          <GroupSelector activeGroupId={activeGroupId} onSelectGroup={setActiveGroupId} />
          <button onClick={() => signOut(auth)} className="text-sm font-medium text-red-600 hover:text-red-700">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 overflow-y-auto">
        {activeTab === 'consumption' && <ConsumptionScreen activeGroupId={activeGroupId} />}
        {activeTab === 'restock' && <RestockScreen activeGroupId={activeGroupId} />}
        {activeTab === 'list' && <GroceryListScreen activeGroupId={activeGroupId} />}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

function AuthScreen() {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
      }, { merge: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to Smart Pantry</h2>
          <p className="text-slate-500 text-sm mt-2">Sign in to manage your inventory and grocery lists.</p>
        </div>
        
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        
        <button 
          onClick={handleSubmit} 
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
