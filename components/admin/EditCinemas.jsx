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
  const [halls, setHalls] = useState([]); // [{ original: string, current: string }]
  const [newHallNumber, setNewHallNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Admin kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        const token = await user.getIdTokenResult();
        if (!token.claims.admin) {
          router.push('/admin/login');
        } else {
          fetchCinema();
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Firebase'ten sinema bilgilerini ve salonları çek
  const fetchCinema = async () => {
    if (!id) return;

    try {
      // Fetch cinema details
      const docRef = doc(db, 'cinemas', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setLocation(data.location);
        setSeats(data.seats?.toString() ?? '');
        
        // Doğrudan cinemas koleksiyonundaki halls alanını kullan
        const hallList = Array.isArray(data.halls) 
          ? data.halls.map(hall => ({ original: hall, current: hall }))
          : [];
        setHalls(hallList);
      } else {
        alert('Sinema bulunamadı.');
        router.push('/admin/cinemas');
        return;
      }
    } catch (error) {
      console.error('Veri alınırken hata:', error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Update hall input value
  const handleHallChange = (index, value) => {
    setHalls((prev) =>
      prev.map((hall, i) => (i === index ? { ...hall, current: value } : hall))
    );
  };

  // Remove a hall
  const handleRemoveHall = (index) => {
    setHalls(prev => prev.filter((_, i) => i !== index));
  };

  // Add new hall
  const handleAddHall = () => {
    if (newHallNumber.trim()) {
      setHalls(prev => [...prev, { 
        original: newHallNumber, 
        current: newHallNumber 
      }]);
      setNewHallNumber('');
    }
  };

  const handleUpdate = async () => {
    try {
      // Validate inputs
      if (!name.trim() || !location.trim()) {
        alert('Sinema adı ve konum zorunludur.');
        return;
      }

      // Güncellenmiş salon listesi
      const updatedHalls = halls.map(hall => hall.current).filter(hall => hall.trim());

      // Update cinemas collection
      await updateDoc(doc(db, 'cinemas', id), {
        name,
        location,
        seats: parseInt(seats) || 0,
        halls: updatedHalls.length > 0 ? updatedHalls : ['Bilinmeyen Salon']
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
    <div className="relative min-h-screen bg-black">
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
          className="w-full p-4 mb-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Sandalye Sayısı"
          whileFocus={{ scale: 1.02 }}
        />

        {/* Existing Halls */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Salonlar</label>
          {halls.length > 0 ? (
            halls.map((hall, index) => (
              <div key={`hall-${index}`} className="flex items-center mb-2">
                <motion.input
                  value={hall.current}
                  onChange={(e) => handleHallChange(index, e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Salon ${index + 1}`}
                  whileFocus={{ scale: 1.02 }}
                />
                <button
                  onClick={() => handleRemoveHall(index)}
                  className="ml-2 p-2 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Henüz salon eklenmemiş.</p>
          )}
        </div>

        {/* Add New Hall */}
        <div className="flex mb-6">
          <motion.input
            value={newHallNumber}
            onChange={(e) => setNewHallNumber(e.target.value)}
            className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Yeni Salon Ekle (örn. Salon 1)"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            onClick={handleAddHall}
            whileHover={{ scale: 1.05 }}
            className="ml-2 px-4 bg-green-600 rounded hover:bg-green-700 transition-all"
          >
            Ekle
          </motion.button>
        </div>

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
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg p-6 shadow-2xl border border-green-300/30 flex items-center space-x-3 max-w-sm w-full z-50"
        >
          <span className="text-2xl">✔️</span>
          <p className="text-lg font-medium">Başarıyla güncellendi! Yönlendiriliyorsunuz...</p>
        </motion.div>
      )}
    </div>
  );
}