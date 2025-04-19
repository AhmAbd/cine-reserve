'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const useRequireAuth = () => {
  const [user, setUser] = useState(null); // Başlangıçta null
  const [loading, setLoading] = useState(true); // Yükleme durumu
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/');
        setLoading(false);
      } else {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser({ ...firebaseUser, ...userSnap.data() });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, loading }; // Hem user hem de loading durumunu döndür
};

export default useRequireAuth;