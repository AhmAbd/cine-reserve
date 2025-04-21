'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

export default function SuspendUser({ userId, currentStatus }) {
  const [isSuspended, setIsSuspended] = useState(currentStatus);
  const [isAdmin, setIsAdmin] = useState(false); // Admin kontrolü için state ekledik
  const [loading, setLoading] = useState(false); // Yükleniyor durumu için state

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

    setLoading(true); // Yükleme başlat
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        suspended: !isSuspended,
      });
      setIsSuspended(!isSuspended);
    } catch (error) {
      console.error('Hata oluştu:', error);
    } finally {
      setLoading(false); // Yükleme tamamlandı
    }
  };

  // Admin kullanıcıları için butonu render etmemek
  if (isAdmin) {
    return null; // Admin için buton hiç render edilmesin
  }

  return (
    <motion.button
      onClick={toggleSuspension}
      className={`px-6 py-3 text-sm rounded-lg transition duration-300 ${
        isSuspended ? 'bg-red-600' : 'bg-green-600'
      } text-white`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
      ) : (
        isSuspended ? 'Askıyı Kaldır' : 'Askıya Al'
      )}
    </motion.button>
  );
}
