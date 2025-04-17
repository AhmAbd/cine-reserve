'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function SuspendUser({ userId, currentStatus }) {
  const [isSuspended, setIsSuspended] = useState(currentStatus);
  const [isAdmin, setIsAdmin] = useState(false); // Admin kontrolü için state ekledik

  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin'); // Admin olup olmadığını kontrol et
        }
      } catch (error) {
        console.error('Hata oluştu:', error);
      }
    };

    checkIfAdmin();
  }, [userId]);

  const toggleSuspension = async () => {
    if (isAdmin) {
      // Admin kullanıcılarının askıya alınmasını engelle
      alert('Admin kullanıcıları askıya alınamaz.');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      suspended: !isSuspended,
    });
    setIsSuspended(!isSuspended);
  };

  // Admin kullanıcıları için butonu render etmemek
  if (isAdmin) {
    return null; // Admin için buton hiç render edilmesin
  }

  return (
    <button
      onClick={toggleSuspension}
      className={`px-3 py-1 text-sm rounded ${
        isSuspended ? 'bg-red-500' : 'bg-green-500'
      } text-white`}
    >
      {isSuspended ? 'Askıyı Kaldır' : 'Askıya Al'}
    </button>
  );
}
