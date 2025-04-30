'use client';

import { useState } from 'react';
import { collection, addDoc, setDoc, serverTimestamp, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [hallCount, setHallCount] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState(40);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Check if hallNumbers already exist for this cinema name
  const checkCinemaExists = async (cinemaName, hallNumbers) => {
    // Step 1: Check if a cinema with this name exists in cinemas collection
    const cinemaQuery = query(
      collection(db, 'cinemas'),
      where('name', '==', cinemaName.trim())
    );
    const cinemaSnapshot = await getDocs(cinemaQuery);

    if (cinemaSnapshot.empty) {
      // No cinema with this name exists, so no hall conflicts
      return false;
    }

    // Step 2: Get the cinema ID(s) and check films collection for hall conflicts
    const cinemaIds = cinemaSnapshot.docs.map((doc) => doc.id);
    const filmsSnapshot = await getDocs(collection(db, 'films'));
    const existingHalls = new Set();

    filmsSnapshot.forEach((docSnap) => {
      const filmData = docSnap.data();
      if (Array.isArray(filmData.cinemas)) {
        filmData.cinemas.forEach((s) => {
          // Check if the hallNumber is used by this cinema's ID
          if (cinemaIds.includes(s.id) && hallNumbers.includes(s.hallNumber)) {
            existingHalls.add(s.hallNumber);
          }
        });
      }
    });

    return existingHalls.size > 0 ? Array.from(existingHalls) : false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate inputs
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

      // Generate hall numbers (Salon 1, Salon 2, ...)
      const hallNumbers = Array.from({ length: hallCountNum }, (_, i) => `Salon ${i + 1}`);

      // Check for existing halls for this cinema name
      const existingHalls = await checkCinemaExists(name, hallNumbers);
      if (existingHalls) {
        setMessage(`❌ Şu salon numaraları zaten mevcut: ${existingHalls.join(', ')}`);
        setLoading(false);
        return;
      }

      // Add cinema to cinemas collection
      const slug = generateSlug(name);
      const cinemaDoc = await addDoc(collection(db, 'cinemas'), {
        name,
        location,
        seats: Number(seats),
        slug,
        halls: hallNumbers,
        createdAt: serverTimestamp(),
      });

      // Add halls to films collection
      const filmsSnapshot = await getDocs(collection(db, 'films'));
      let filmId = null;
      if (filmsSnapshot.empty) {
        // Create a placeholder film
        filmId = `placeholder-${cinemaDoc.id}`;
        await setDoc(doc(db, 'films', filmId), {
          title: 'Placeholder Film',
          cinemas: hallNumbers.map((hallNumber) => ({
            id: cinemaDoc.id,
            hallNumber,
            showtime: '',
          })),
        });
      } else {
        // Use the first film for simplicity
        filmId = filmsSnapshot.docs[0].id;
        const filmData = filmsSnapshot.docs[0].data();
        const updatedCinemas = Array.isArray(filmData.cinemas)
          ? [
              ...filmData.cinemas,
              ...hallNumbers.map((hallNumber) => ({
                id: cinemaDoc.id,
                hallNumber,
                showtime: '',
              })),
            ]
          : hallNumbers.map((hallNumber) => ({
              id: cinemaDoc.id,
              hallNumber,
              showtime: '',
            }));

        await setDoc(doc(db, 'films', filmId), {
          ...filmData,
          cinemas: updatedCinemas,
        });
      }

      setMessage('✅ Sinema ve salonlar başarıyla eklendi!');
      setName('');
      setHallCount('');
      setLocation('');
      setSeats(40);
    } catch (err) {
      console.error('Hata:', err);
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

      {/* Notification Modal */}
      <AnimatePresence>
        {message && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative z-50 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${
                message.startsWith('✅')
                  ? 'bg-gradient-to-br from-green-600/80 to-green-700/80'
                  : 'bg-gradient-to-br from-red-600/80 to-red-700/80'
              } backdrop-blur-sm border border-white/10`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.startsWith('✅') ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {message.startsWith('✅') ? 'Başarılı!' : 'Hata!'}
                </h3>
                <p className="text-gray-200 mb-4">
                  {message.replace(/^(\✅|\❌)\s*/, '')}
                </p>
                {message.startsWith('✅') && (
                  <div className="w-full bg-green-100/20 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-green-300 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                )}
                {message.startsWith('❌') && (
                  <motion.button
                    className="mt-4 px-4 py-2 bg-gray-800/50 text-white rounded-lg text-sm border border-purple-500/30"
                    onClick={() => setMessage('')}
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)', scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    Kapat
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}