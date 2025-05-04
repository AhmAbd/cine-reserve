'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'; // Added addDoc
import { getAuth } from 'firebase/auth';
import { Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const useAuthStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export default function SelectTicketType() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');
  const hall = searchParams.get('hall');

  const { user, loading } = useAuthStatus();
  const [counts, setCounts] = useState({ full: 1, student: 0 });
  const [prices, setPrices] = useState({ full: 0, student: 0 });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [movieName, setMovieName] = useState('');
  const [cinemaName, setCinemaName] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [isSaving, setIsSaving] = useState(false); // Prevent multiple saves

  // Validate query parameters
  if (!movieId || !cinemaId || !hall) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] text-white flex justify-center items-center">
        <p>Hata: Film, sinema veya salon bilgisi eksik. Lütfen bilgileri kontrol edin.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prices
        const priceDocRef = doc(db, 'prices', 'ticketTypes');
        const priceDoc = await getDoc(priceDocRef);
        if (priceDoc.exists()) {
          setPrices(priceDoc.data());
        } else {
          setFetchError('Fiyat bilgileri bulunamadı.');
        }

        // Fetch movie name
        const movieDocRef = doc(db, 'films', movieId);
        const movieDoc = await getDoc(movieDocRef);
        if (movieDoc.exists()) {
          setMovieName(movieDoc.data().title);
        } else {
          setFetchError('Film bilgileri bulunamadı.');
        }

        // Fetch cinema name
        const cinemaDocRef = doc(db, 'cinemas', cinemaId);
        const cinemaDoc = await getDoc(cinemaDocRef);
        if (cinemaDoc.exists()) {
          setCinemaName(cinemaDoc.data().name);
        } else {
          setFetchError('Sinema bilgileri bulunamadı.');
        }

        // Parse session time from hall parameter
        // Changed: Use full hall string as sessionTime
        setSessionTime(hall); // e.g., '2025-05-04T14:30:00|Salon1'
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError('Veri yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    };
    fetchData();
  }, [movieId, cinemaId, hall]);

  const total = counts.full * prices.full + counts.student * prices.student;
  const isPriceLoaded = prices.full !== 0 && prices.student !== 0;

  const handleCount = (type, delta) => {
    setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const handleLogin = () => {
    const redirectUrl = encodeURIComponent(
      `/tickets/select-type?movie=${movieId}&cinema=${cinemaId}&hall=${encodeURIComponent(hall)}`
    );
    router.push(`/login?redirect=${redirectUrl}`);
  };

  const handleContinueAsGuest = async () => {
    if (isSaving) return; // Prevent multiple clicks
    setIsSaving(true);
    setShowAuthDialog(false);

    try {
      // Changed: Generate bookingId in Firestore guestTickets
      const bookingRef = await addDoc(collection(db, 'guestTickets'), {
        cinemaId,
        cinemaName: cinemaName || 'Sinema Adı Bilinmiyor',
        fullCount: counts.full,
        movieId,
        movieName: movieName || 'Film Adı Bilinmiyor',
        session: sessionTime || 'Seans Bilinmiyor',
        studentCount: counts.student,
        timestamp: serverTimestamp(),
        totalPrice: total,
        status: 'pending',
      });
      const bookingId = bookingRef.id;
      console.log('Select-Type: Guest bookingId generated:', bookingId);

      const selectSeatUrl = `/tickets/select-seat?movie=${encodeURIComponent(movieId)}&cinema=${encodeURIComponent(cinemaId)}&booking=${encodeURIComponent(bookingId)}&full=${counts.full}&student=${counts.student}&session=${encodeURIComponent(sessionTime)}&guest=true`;
      console.log('Select-Type: Navigating to:', selectSeatUrl);
      router.push(selectSeatUrl);
    } catch (error) {
      console.error('Guest booking error:', error);
      setTicketError('Misafir bileti oluşturulurken hata oluştu: ' + error.message);
      setIsSaving(false);
    }
  };

  const saveUserTicket = async (ticketId) => {
    try {
      const ticketData = {
        cinemaId,
        cinemaName: cinemaName || 'Sinema Adı Bilinmiyor',
        fullCount: counts.full,
        movieId,
        movieName: movieName || 'Film Adı Bilinmiyor',
        session: sessionTime || 'Seans Bilinmiyor',
        studentCount: counts.student,
        timestamp: serverTimestamp(),
        totalPrice: total,
        userId: user.uid,
        status: 'pending',
      };

      await setDoc(doc(db, 'tickets', ticketId), ticketData);
      return ticketId;
    } catch (error) {
      console.error('Bilet kaydetme hatası:', error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (isSaving) return; // Prevent multiple clicks
    setIsSaving(true);

    try {
      if (counts.full + counts.student <= 0) {
        throw new Error('En az 1 bilet seçmelisiniz');
      }
      // Added: Validate sessionTime
      if (!sessionTime) {
        throw new Error('Seans bilgisi eksik');
      }

      if (!user && !loading) {
        setShowAuthDialog(true);
        setIsSaving(false);
        return;
      }

      if (user) {
        const ticketId = doc(collection(db, 'tickets')).id; // Use Firestore auto-generated ID
        await saveUserTicket(ticketId);
        // Changed: Standardized URL with logging
        const selectSeatUrl = `/tickets/select-seat?movie=${encodeURIComponent(movieId)}&cinema=${encodeURIComponent(cinemaId)}&booking=${encodeURIComponent(ticketId)}&full=${counts.full}&student=${counts.student}&session=${encodeURIComponent(sessionTime)}&guest=false`;
        console.log('Select-Type: User bookingId generated:', ticketId);
        console.log('Select-Type: Navigating to:', selectSeatUrl);
        router.push(selectSeatUrl);
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      setTicketError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] text-white flex justify-center items-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] text-white flex justify-center items-center">
        <p>{fetchError} Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1f1f] to-[#2b2b2b] text-white p-4 sm:p-6 flex justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none" />

      <motion.div
        className="w-full max-w-4xl bg-[#2b2b2b]/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Bilet Seçimi
            </h2>
            <p className="text-sm text-gray-300 mt-2 max-w-md">
              Film ve seansı seçtin, şimdi bilet tipini seçmen gerekiyor. Öğrenci bileti için kimlik gerekebilir.
            </p>
          </motion.div>
          <motion.div
            className="text-right"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-gray-400">Toplam Fiyat</p>
            {isPriceLoaded ? (
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">{total} TL</p>
            ) : (
              <p className="text-lg text-gray-400">Fiyat yükleniyor...</p>
            )}
            <motion.button
              onClick={handleContinue}
              className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition disabled:opacity-50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSaving}
            >
              {isSaving ? 'İşleniyor...' : 'Devam Et'}
            </motion.button>
          </motion.div>
        </div>

        {ticketError && (
          <motion.div
            className="bg-red-500/20 text-red-300 p-4 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {ticketError}
          </motion.div>
        )}

        <AnimatePresence>
          {showAuthDialog && (
            <motion.div
              className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="bg-[#2b2b2b]/60 backdrop-blur-lg rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl border-2 border-transparent bg-gradient-to-r from-purple-600/30 to-blue-600/30 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <h3 className="text-2xl font-extrabold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  Giriş Yap
                </h3>
                <p className="text-gray-200 mb-6 text-sm sm:text-base">
                  Bilet seçimine devam etmek için giriş yapabilir veya giriş yapmadan devam edebilirsiniz.
                </p>
                <div className="flex flex-col gap-4">
                  <motion.button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Giriş Yap
                  </motion.button>
                  <motion.button
                    onClick={handleContinueAsGuest}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 10px rgba(75, 85, 99, 0.5)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Giriş Yapmadan Devam Et
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {[
            { key: 'full', label: 'TAM', price: prices.full },
            { key: 'student', label: 'ÖĞRENCİ', price: prices.student },
          ].map((type, index) => (
            <motion.div
              key={type.key}
              className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 text-black rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200/50"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="bg-gradient-to-br from-purple-500 to-blue-500 text-white p-3 rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  🎟️
                </motion.div>
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-800">{type.label}</p>
                  <p className="text-sm text-gray-500">{type.price} TL</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => handleCount(type.key, -1)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-black rounded-full flex items-center justify-center shadow"
                  whileTap={{ scale: 0.9, rotate: -10 }}
                >
                  <Minus size={18} />
                </motion.button>
                <motion.span
                  className="w-8 text-center font-semibold text-lg"
                  key={counts[type.key]}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {counts[type.key]}
                </motion.span>
                <motion.button
                  onClick={() => handleCount(type.key, 1)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-black rounded-full flex items-center justify-center shadow"
                  whileTap={{ scale: 0.9, rotate: 10 }}
                >
                  <Plus size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}