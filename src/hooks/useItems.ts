import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Item } from '../types';

export function useItems(activeGroupId: string | null) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const ownerId = activeGroupId || auth.currentUser.uid;
    const isGroup = !!activeGroupId;

    const q = query(
      collection(db, 'items'),
      where('ownerId', '==', ownerId),
      where('isGroup', '==', isGroup)
    );

    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Item)));
    });

    return unsub;
  }, [activeGroupId]);

  return items;
}
