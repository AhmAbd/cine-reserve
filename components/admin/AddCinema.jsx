'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [hallNumber, setHallNumber] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState(40);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const checkCinemaExists = async (cinemaName, hallNum) => {
    const q = query(
      collection(db, 'cinemas'),
      where('name', '==', cinemaName),
      where('hallNumber', '==', hallNum)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!hallNumber) {
        setMessage('❌ Salon numarası giriniz');
        setLoading(false);
        return;
      }

      const slug = generateSlug(`${name}-${hallNumber}`);
      const cinemaExists = await checkCinemaExists(name, hallNumber);

      if (cinemaExists) {
        setMessage('❌ Bu sinema salonu ve salon numarası zaten mevcut');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'cinemas'), {
        name,
        hallNumber,
        slug,
        location,
        seats: Number(seats),
        createdAt: serverTimestamp()
      });

      setMessage('✅ Sinema ve salon başarıyla eklendi!');
      setName('');
      setHallNumber('');
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
            <label className="block text-sm text-gray-400 mb-1">Salon Numarası</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={hallNumber}
              onChange={(e) => setHallNumber(e.target.value)}
              placeholder="Ör: Salon 1"
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
          {loading ? '⏳ Yükleniyor...' : ' Sinema ve Salon Ekle'}
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