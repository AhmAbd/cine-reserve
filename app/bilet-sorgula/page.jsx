'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import QRCode from 'react-qr-code';

const TicketSearchPage = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateInputs = () => {
    if (!email && !phone) {
      setError('Lütfen e-posta veya telefon numarası girin.');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return false;
    }
    if (phone && !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası girin (örn. +905123456789).');
      return false;
    }
    return true;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setTickets([]);
    setSearched(true);
    setLoading(true);

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      const fetchedTickets = [];

      if (user) {
        try {
          const ticketQuery = query(
            collection(db, 'tickets'),
            where('userId', '==', user.uid)
          );
          const ticketSnapshot = await getDocs(ticketQuery);
          fetchedTickets.push(...ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.warn('TicketSearchPage: Error querying tickets collection:', err.message);
        }
      }

      let guestQueryConstraints = [];
      if (email) {
        guestQueryConstraints.push(where('guestInfo.email', '==', email));
      }
      if (phone) {
        guestQueryConstraints.push(where('guestInfo.phoneNumber', '==', phone.replace(/\s/g, '')));
      }

      if (guestQueryConstraints.length > 0) {
        try {
          const guestQuery = query(
            collection(db, 'guestTickets'),
            ...guestQueryConstraints
          );
          const guestSnapshot = await getDocs(guestQuery);
          fetchedTickets.push(...guestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.warn('TicketSearchPage: Error querying guestTickets collection:', err.message);
        }
      }

      const processedTickets = await Promise.all(
        fetchedTickets.map(async (ticket) => {
          let hallInfo = '—';
          let movieTitle = ticket.movieName || 'Film Bilinmiyor';
          let cinemaLocation = 'Konum bulunamadı';
          let sessionDisplay = '—';

          // Set hallInfo based on session or films collection
          if (ticket.session && typeof ticket.session === 'string' && ticket.session.includes('Salon')) {
            hallInfo = ticket.session;
          } else if (ticket.movieId) {
            try {
              const movieRef = doc(db, 'films', ticket.movieId);
              const movieSnap = await getDoc(movieRef);

              if (movieSnap.exists()) {
                const movieData = movieSnap.data();
                console.log('Films Collection Data:', movieData); // Debug log
                movieTitle = movieData.title || movieTitle;

                const cinemaInfo = movieData.cinemas?.find(c => c.id === ticket.cinemaId);
                if (cinemaInfo) {
                  hallInfo = cinemaInfo.hallNumber || '—';
                }
              }
            } catch (err) {
              console.warn('TicketSearchPage: Error fetching movie data:', err.message);
            }
          }

          // Set sessionDisplay based on date-time parsing (skip if session is a hall name)
          if (ticket.session && typeof ticket.session === 'string' && !ticket.session.includes('Salon')) {
            try {
              let sessionDate = null;
              const [datePart] = ticket.session.split('|');
              sessionDate = new Date(datePart || ticket.session);

              if (sessionDate && !isNaN(sessionDate.getTime())) {
                sessionDate.setHours(sessionDate.getHours() + 3); // Adjust for UTC+3
                sessionDisplay = sessionDate.toLocaleString('tr-TR', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });
              }
            } catch (err) {
              console.warn('TicketSearchPage: Error parsing session:', err.message);
            }
          } else if (ticket.session?.toDate && typeof ticket.session.toDate === 'function') {
            try {
              const sessionDate = ticket.session.toDate();
              sessionDate.setHours(sessionDate.getHours() + 3); // Adjust for UTC+3
              sessionDisplay = sessionDate.toLocaleString('tr-TR', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
            } catch (err) {
              console.warn('TicketSearchPage: Error parsing session timestamp:', err.message);
            }
          }

          // Fetch cinemaLocation from cinemas collection
          if (ticket.cinemaId) {
            try {
              const cinemaRef = doc(db, 'cinemas', ticket.cinemaId);
              const cinemaSnap = await getDoc(cinemaRef);

              if (cinemaSnap.exists()) {
                const cinemaData = cinemaSnap.data();
                console.log('Cinemas Collection Data:', cinemaData); // Debug log
                cinemaLocation = cinemaData.location || 'Konum bulunamadı';
              }
            } catch (err) {
              console.warn('TicketSearchPage: Error fetching cinema data:', err.message);
            }
          }

          return {
            ...ticket,
            movieName: movieTitle,
            hallDisplay: hallInfo,
            sessionDisplay,
            cinemaLocation
          };
        })
      );

      setTickets(processedTickets);
      if (processedTickets.length === 0) {
        setError('Girdiğiniz bilgilerle eşleşen bilet bulunamadı.');
      }
    } catch (err) {
      console.error('Biletler aranırken hata:', err);
      setError('Biletler aranırken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex justify-center items-center">
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
      </div>
    );
  }

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
              🎟️ Bilet Sorgula
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
              E-posta veya telefon numarası ile biletlerinizi arayın
            </motion.p>
          </motion.div>
        </Tilt>

        {/* Search Form */}
        <motion.div
          className="mb-12 bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl p-6 border border-purple-500/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ornek@ornek.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+905123456789"
                />
              </div>
            </div>
            {error && (
              <motion.p
                className="text-red-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}
            <div className="text-center">
              <motion.button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-indigo-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? 'Aranıyor...' : 'Bilet Ara'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Ticket Results */}
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
                <p className="text-gray-200 text-lg">Biletler aranıyor...</p>
              </div>
            </motion.div>
          ) : searched && tickets.length === 0 ? (
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
              <p className="text-gray-200 text-lg">Bilet bulunamadı.</p>
              <p className="text-gray-400 text-sm mt-2">
                Girdiğiniz bilgilerle eşleşen bilet yok. Lütfen bilgileri kontrol edin.
              </p>
            </motion.div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.2} glareColor="#9333ea">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-xl border border-gray-300 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      {/* Ticket Details */}
                      <div className="flex-1 text-gray-800">
                        <div className="text-xl font-bold text-purple-600 mb-2">
                          🎬 {ticket.movieName}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Sinema:</span> {ticket.cinemaName || '—'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Salon:</span> {ticket.hallDisplay}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Seans:</span> {ticket.sessionDisplay}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Koltuklar:</span> {ticket.seats?.length > 0 ? ticket.seats.join(', ') : '—'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Fiyat:</span> {ticket.totalPrice != null ? `${ticket.totalPrice} ₺` : '—'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Bilet ID:</span> {ticket.id}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Rezervasyon: {ticket.timestamp?.toDate
                            ? ticket.timestamp.toDate().toLocaleString('tr-TR', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })
                            : '—'}
                        </div>
                      </div>
                      {/* QR Codes */}
                      <div className="flex flex-col space-y-4 items-center">
                        <div className="text-center">
                          <QRCode
                            value={ticket.id}
                            size={80}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            className="border-2 border-purple-500 rounded"
                          />
                          <p className="text-xs text-gray-700 mt-1">Bilet ID</p>
                        </div>
                        <div className="text-center">
                          <QRCode
                            value={ticket.cinemaLocation}
                            size={80}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            className="border-2 border-purple-500 rounded"
                          />
                          <p className="text-xs text-gray-700 mt-1">Konum</p>
                        </div>
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicketSearchPage;