'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState(40);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const checkCinemaExists = async (cinemaName) => {
    const q = query(
      collection(db, 'cinemas'),
      where('name', '==', cinemaName)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Eğer sinema varsa, boş değil.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const slug = generateSlug(name);
      const cinemaExists = await checkCinemaExists(name);

      if (cinemaExists) {
        setMessage('❌ Bu sinema salonu zaten mevcut.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'cinemas'), {
        name,
        slug,
        location,
        seats: Number(seats),
        createdAt: serverTimestamp()
      });

      setMessage('✅ Sinema başarıyla eklendi!');
      setName('');
      setLocation('');
      setSeats(40);
    } catch (err) {
      console.error(err);
      setMessage('❌ Hata oluştu: ' + err.message);
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
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">🎬 Yeni Sinema Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sinema Adı"
          required
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Google Maps Linki"
          required
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="number"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          placeholder="Toplam Koltuk Sayısı"
          required
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#a020f0] py-3 rounded-xl text-white font-semibold hover:bg-purple-700 transition shadow-md"
        >
          {loading ? '⏳ Yükleniyor...' : ' Sinema Ekle'}
        </motion.button>
      </form>

      {message && (
        <motion.p
          className={`mt-5 text-center text-sm ${
            message.startsWith('✅') ? 'text-green-400' : 'text-red-400'
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
