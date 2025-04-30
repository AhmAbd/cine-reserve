'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const TicketsPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchTickets = async () => {
      try {
        const q = query(
          collection(db, 'tickets'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const fetchedTickets = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const ticket = docSnapshot.data();

            // Film bilgilerini al
            let hallInfo = '—';
            let movieTitle = ticket.movieName || 'Film Bilinmiyor';

            if (ticket.movieId) {
              const movieRef = doc(db, 'films', ticket.movieId);
              const movieSnap = await getDoc(movieRef);

              if (movieSnap.exists()) {
                const movieData = movieSnap.data();
                movieTitle = movieData.title || movieTitle;

                // İlgili sinema bilgisini bul
                const cinemaInfo = movieData.cinemas?.find(
                  c => c.id === ticket.cinemaId
                );

                // Salon bilgisini al
                if (cinemaInfo?.hallNumber) {
                  hallInfo = `${cinemaInfo.hallNumber}`;
                }
              }
            }

            return {
              ...ticket,
              movieName: movieTitle,
              hallDisplay: hallInfo
            };
          })
        );

        setTickets(fetchedTickets);
      } catch (err) {
        console.error('Biletler alınırken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* Parallax Background */}
      <div className="fixed inset-0 z-[-2]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] opacity-80"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-indigo-900/30 opacity-50"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header with Tilt */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareColor="#9333ea">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/40 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              🎟️ Geçmiş Biletlerim
            </motion.h2>
            <motion.div
              className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-lg text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Satın aldığınız tüm biletleri burada görüntüleyin
            </motion.p>
          </motion.div>
        </Tilt>

        <AnimatePresence>
          {loading ? (
            <motion.div
              className="flex justify-center items-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="animate-spin h-10 w-10 text-purple-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <p className="text-gray-200 text-lg">Biletler yükleniyor...</p>
              </div>
            </motion.div>
          ) : tickets.length === 0 ? (
            <motion.div
              className="text-center py-12 bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl border border-purple-500/30 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <p className="text-gray-200 text-lg">Henüz bilet satın almadınız.</p>
              <p className="text-gray-400 text-sm mt-2">
                Hemen bir film seçip bilet alabilirsiniz!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.2} glareColor="#9333ea">
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-6 space-y-4 border border-purple-500/30 shadow-xl hover:shadow-purple-500/20 transition-shadow duration-300">
                      <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        🎬 {ticket.movieName}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Seans:</span>{' '}
                        {ticket.session
                          ? new Date(ticket.session).toLocaleString('tr-TR', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : '—'}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Sinema:</span>{' '}
                        {ticket.cinemaName || '—'}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Salon:</span>{' '}
                        {ticket.hallDisplay}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Koltuklar:</span>{' '}
                        {ticket.seats?.length > 0 ? ticket.seats.join(', ') : '—'}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Rezervasyon Tarihi:</span>{' '}
                        {ticket.timestamp?.toDate
                          ? ticket.timestamp.toDate().toLocaleString('tr-TR', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : '—'}
                      </div>
                      <div className="text-lg font-bold text-green-400">
                        Toplam: {ticket.totalPrice != null ? `${ticket.totalPrice} ₺` : '—'}
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicketsPage;