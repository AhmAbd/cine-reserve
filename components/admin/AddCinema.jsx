'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [hallCount, setHallCount] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState(40);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Kullanıcı kimlik doğrulama durumunu kontrol et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdTokenResult().then((token) => {
          console.log('Kullanıcı giriş yaptı:', user.uid, 'Admin:', token.claims.admin);
        }).catch((err) => {
          console.error('Token hatası:', err);
        });
      } else {
        console.log('Kullanıcı giriş yapmamış');
      }
    });

    return () => unsubscribe();
  }, []);

  // URL dostu slug oluşturma
  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Form gönderim işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Giriş doğrulamaları
      if (!name.trim()) {
        setMessage('❌ Sinema adı giriniz');
        setLoading(false);
        return;
      }
      if (!location.trim()) {
        setMessage('❌ Konum giriniz');
        setLoading(false);
        return;
      }
      const hallCountNum = parseInt(hallCount) || 0;
      if (hallCountNum <= 0) {
        setMessage('❌ En az bir salon eklemelisiniz');
        setLoading(false);
        return;
      }

      // Salon numaralarını oluştur (Salon 1, Salon 2, ...)
      const hallNumbers = Array.from({ length: hallCountNum }, (_, i) => `Salon ${i + 1}`);
      console.log('Oluşturulan salonlar:', hallNumbers);

      // Sinemayı cinemas koleksiyonuna ekle
      const slug = generateSlug(name);
      console.log('Sinema ekleniyor:', { name, location, seats, slug, hallNumbers });
      
      await addDoc(collection(db, 'cinemas'), {
        name,
        location,
        seats: Number(seats),
        slug,
        halls: hallNumbers,
        createdAt: serverTimestamp(),
      });

      setMessage('✅ Sinema ve salonlar başarıyla eklendi!');
      setName('');
      setHallCount('');
      setLocation('');
      setSeats(40);
    } catch (err) {
      console.error('Firestore hatası:', err, 'Kod:', err.code, 'Mesaj:', err.message);
      setMessage(`❌ Hata oluştu: ${err.code || err.message}`);
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="p-8 text-white max-w-xl mx-auto bg-[#111827] rounded-2xl shadow-2xl border border-gray-700"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">🎬 Yeni Sinema ve Salon Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sinema Adı</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ör: Cinemaximum"
              required
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Salon Sayısı</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="number"
              value={hallCount}
              onChange={(e) => setHallCount(e.target.value)}
              min="1"
              placeholder="Ör: 3"
              required
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Konum (Google Maps Linki)</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="https://maps.google.com/..."
            required
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Koltuk Sayısı</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            min="1"
            required
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#a020f0] py-3 rounded-xl text-white font-semibold hover:bg-purple-700 transition shadow-md"
        >
          {loading ? '⏳ Yükleniyor...' : 'Sinema ve Salon Ekle'}
        </motion.button>
      </form>

      {message && (
        <motion.p
          className={`mt-5 text-center text-sm ${
            message.startsWith('✅') ? 'text-green-400' : message.startsWith('⚠️') ? 'text-yellow-400' : 'text-red-400'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}