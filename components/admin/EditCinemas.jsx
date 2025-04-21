'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function EditCinemaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Admin kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        fetchCinema(); // sadece giriş varsa veriyi çek
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase'ten sinema bilgilerini çek
  const fetchCinema = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, 'cinemas', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setLocation(data.location);
        setSeats(data.seats ?? '');
      } else {
        alert('Sinema bulunamadı.');
        router.push('/admin/cinemas');
      }
    } catch (error) {
      console.error('Veri alınırken hata:', error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'cinemas', id), {
        name,
        location,
        seats: parseInt(seats) || 0,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/cinemas');
      }, 2000);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/cinemas');
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-20 animate-pulse">Yükleniyor...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg mt-12 shadow-2xl"
    >
      <motion.h2
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Sinema Düzenle
      </motion.h2>

      <motion.input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-4 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Sinema Adı"
        whileFocus={{ scale: 1.02 }}
      />
      <motion.input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-4 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Konum"
        whileFocus={{ scale: 1.02 }}
      />
      <motion.input
        type="number"
        value={seats}
        onChange={(e) => setSeats(e.target.value)}
        className="w-full p-4 mb-6 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Sandalye Sayısı"
        whileFocus={{ scale: 1.02 }}
      />

      <div className="flex justify-between">
        <motion.button
          onClick={handleCancel}
          whileHover={{ scale: 1.05 }}
          className="bg-gray-600 px-5 py-2 rounded hover:bg-gray-700 transition-all"
        >
          İptal
        </motion.button>
        <motion.button
          onClick={handleUpdate}
          whileHover={{ scale: 1.05 }}
          className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-700 transition-all"
        >
          Güncelle
        </motion.button>
      </div>

      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-green-400 text-center"
        >
          ✔️ Başarıyla güncellendi! Yönlendiriliyorsunuz...
        </motion.p>
      )}
    </motion.div>
  );
}
