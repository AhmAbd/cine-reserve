'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import useRequireAuth from '../../../hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Tilt from 'react-parallax-tilt';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useRequireAuth();

  const seats = searchParams.get('seats')?.split(',') || [];
  const fullCount = parseInt(searchParams.get('full') || '0');
  const studentCount = parseInt(searchParams.get('student') || '0');
  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');
  const bookingId = searchParams.get('booking');

  const [prices, setPrices] = useState({ full: 0, student: 0 });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [movieDetails, setMovieDetails] = useState({ title: '', poster: '' });
  const [cinemaDetails, setCinemaDetails] = useState({ name: '', location: '' });

  const total = fullCount * prices.full + studentCount * prices.student;
  const seatDocId = `${movieId}_${cinemaId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prices
        const priceDoc = await getDoc(doc(db, 'prices', 'ticketTypes'));
        if (priceDoc.exists()) setPrices(priceDoc.data());

        // Fetch movie details
        const movieSnap = await getDoc(doc(db, 'films', movieId));
        if (movieSnap.exists()) setMovieDetails(movieSnap.data());

        // Fetch cinema details
        const cinemaSnap = await getDoc(doc(db, 'cinemas', cinemaId));
        if (cinemaSnap.exists()) setCinemaDetails(cinemaSnap.data());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [movieId, cinemaId]);

  // Unlock seats if user leaves without paying
  useEffect(() => {
    const unlockSeats = async () => {
      if (seats.length === 0 || paymentComplete) return;
      const seatRef = doc(db, 'cinema_seats', seatDocId);
      const seatSnap = await getDoc(seatRef);
      const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };

      const updatedSeats = { ...seatData.seats };
      seats.forEach((seatId) => {
        updatedSeats[seatId] = 'available';
      });

      await setDoc(seatRef, { seats: updatedSeats }, { merge: true });
    };

    const handleUnload = () => unlockSeats();

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload();
    });

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleUnload);
    };
  }, [seats, seatDocId, paymentComplete]);

  const fakePayment = async () => {
    setLoading(true);
    setPaymentStatus('');

    try {
      const seatRef = doc(db, 'cinema_seats', seatDocId);
      const seatSnap = await getDoc(seatRef);
      const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };
      const currentSeats = seatData.seats || {};

      // Check for conflicts
      const conflictSeats = seats.filter(seatId => {
        const value = currentSeats[seatId];
        if (!value) return false;
        if (value.startsWith('booked_')) return true;
        if (value.startsWith('locked_') && value !== `locked_${bookingId}`) return true;
        return false;
      });

      if (conflictSeats.length > 0) {
        setPaymentStatus(`❌ Bu koltuklar başka bir kullanıcı tarafından alındı: ${conflictSeats.join(', ')}`);
        setLoading(false);
        return;
      }

      // Update seats to booked
      const updatedSeats = { ...currentSeats };
      seats.forEach((seatId) => {
        updatedSeats[seatId] = `booked_${bookingId}`;
      });

      await setDoc(seatRef, { seats: updatedSeats }, { merge: true });

      // Save ticket
      const session = (movieDetails?.cinemas || []).find(c => c.id === cinemaId)?.showtime || null;

      const ticketData = {
        userId: user.uid,
        movieId,
        movieName: movieDetails.title,
        cinemaId,
        cinemaName: cinemaDetails.name,
        session,
        seats,
        fullCount,
        studentCount,
        totalPrice: total,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'tickets'), ticketData);

      setPaymentStatus('✅ Ödeme başarılı! 🎉 Biletleriniz oluşturuldu.');
      setPaymentComplete(true);

      setTimeout(() => {
        router.push('/account/tickets');
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* 3D Parallax Background */}
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header with Tilt */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareColor="#9333ea">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/40 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Ödeme Ekranı
            </motion.h1>
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
              Biletlerinizi tamamlamak için son adım
            </motion.p>
          </motion.div>
        </Tilt>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movie Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-purple-500/30 shadow-xl hover:shadow-purple-500/20 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                  Film Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  {movieDetails.poster && (
                    <motion.img
                      src={movieDetails.poster}
                      alt={movieDetails.title}
                      className="w-24 h-36 object-cover rounded-lg shadow-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{movieDetails.title || 'Yükleniyor...'}</h3>
                    <p className="text-sm text-gray-200">{cinemaDetails.name || 'Yükleniyor...'}</p>
                    <p className="text-sm text-gray-300">{cinemaDetails.location || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-purple-500/30 shadow-xl hover:shadow-purple-500/20 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                  Ödeme Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Koltuklar:</span>
                    <span className="font-medium text-white">{seats.join(', ') || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tam Bilet:</span>
                    <span className="font-medium text-white">{fullCount} × {prices.full} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Öğrenci Bilet:</span>
                    <span className="font-medium text-white">{studentCount} × {prices.student} ₺</span>
                  </div>
                  <div className="border-t border-purple-500/30 my-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-200 font-semibold">Toplam:</span>
                    <span className="font-bold text-purple-400">{total} ₺</span>
                  </div>
                </div>

                <AnimatePresence>
                  {paymentStatus && (
                    <motion.div
                      className={`p-4 rounded-lg text-center font-medium ${
                        paymentComplete
                          ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                          : 'bg-red-900/40 text-red-300 border border-red-700/50'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {paymentStatus}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-base font-semibold shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={fakePayment}
                  disabled={loading || paymentComplete}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      İşlem Yapılıyor...
                    </div>
                  ) : paymentComplete ? (
                    'Yönlendiriliyorsunuz...'
                  ) : (
                    'Ödemeyi Tamamla'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}