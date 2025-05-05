'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, runTransaction, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const bookingId = searchParams.get('bookingId');
  const sessionTime = searchParams.get('session');
  const hall = searchParams.get('hall');
  const full = parseInt(searchParams.get('full') || '0');
  const student = parseInt(searchParams.get('student') || '0');
  const isGuest = searchParams.get('guest') === 'true';

  const [ticketData, setTicketData] = useState(null);
  const [filmData, setFilmData] = useState(null);
  const [cinemaData, setCinemaData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [user, setUser] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [prices, setPrices] = useState(null); // Varsayılan fiyatlar kaldırıldı

  useEffect(() => {
    console.log('Payment: Initial parameters:', {
      ticketId,
      bookingId,
      sessionTime,
      hall,
      full,
      student,
      isGuest,
    });
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Payment: Auth state changed, user=', currentUser ? currentUser.uid : null);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [ticketId, bookingId, sessionTime, hall, full, student, isGuest]);

  // Fetch prices from Firebase
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const priceDocRef = doc(db, 'prices', 'ticketTypes');
        const priceDoc = await getDoc(priceDocRef);
        if (priceDoc.exists()) {
          const priceData = priceDoc.data();
          setPrices({
            full: priceData.full,
            student: priceData.student,
          });
          console.log('Payment: Fetched prices=', priceData);
        } else {
          console.error('Payment: Price document does not exist in Firebase');
          setError('Fiyat bilgileri bulunamadı. Lütfen tekrar deneyin.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Payment: Error fetching prices:', err);
        setError('Fiyat bilgileri yüklenirken hata oluştu: ' + err.message);
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Fiyatlar yüklenene kadar bekle
      if (!prices) return;

      try {
        if (!ticketId || !bookingId || !sessionTime || !hall) {
          setError('Gerekli bilgiler eksik: Bilet kimliği, rezervasyon kimliği, seans veya salon bilgisi eksik.');
          setLoading(false);
          return;
        }

        if (full + student <= 0) {
          setError('Bilet sayısı geçersiz. En az 1 bilet seçmelisiniz.');
          setLoading(false);
          return;
        }

        const ticketCollection = isGuest ? 'guestTickets' : 'tickets';
        const ticketDoc = await getDoc(doc(db, ticketCollection, ticketId));

        if (!ticketDoc.exists()) {
          setError('Bilet bulunamadı. Lütfen koltuk seçim adımından tekrar deneyin.');
          setLoading(false);
          return;
        }

        const ticket = ticketDoc.data();
        setTicketData({ ...ticket, isGuest });

        const filmDoc = await getDoc(doc(db, 'films', ticket.movieId));
        if (filmDoc.exists()) {
          setFilmData(filmDoc.data());
        } else {
          setError('Film bilgileri bulunamadı.');
          setLoading(false);
          return;
        }

        const cinemaDoc = await getDoc(doc(db, 'cinemas', ticket.cinemaId));
        if (cinemaDoc.exists()) {
          setCinemaData(cinemaDoc.data());
        } else {
          setError('Sinema bilgileri bulunamadı.');
          setLoading(false);
          return;
        }

        setShowtime(
          ticket.session !== 'Seans Bilinmiyor'
            ? new Date(ticket.session).toLocaleString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Seans Bilinmiyor'
        );

        const seatDocId = `${ticket.movieId}_${ticket.cinemaId}_${encodeURIComponent(sessionTime)}`;
        await runTransaction(db, async (transaction) => {
          const seatRef = doc(db, 'cinema_seats', seatDocId);
          const seatSnap = await transaction.get(seatRef);
          const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };

          const updatedSeats = { ...seatData.seats };
          ticket.seats.forEach((seatId) => {
            if (!updatedSeats[seatId] || updatedSeats[seatId] === 'available' || updatedSeats[seatId].startsWith('locked_')) {
              updatedSeats[seatId] = `locked_${bookingId}`;
              console.log(`Payment: Refreshed lock for seat ${seatId} to locked_${bookingId}`);
            }
          });

          transaction.set(seatRef, { seats: updatedSeats, lockTimestamp: serverTimestamp() }, { merge: true });
        });

        setLoading(false);
      } catch (err) {
        console.error('Payment: Data fetch or lock refresh error:', err);
        setError('Veri yüklenirken veya koltuk kilidi yenilenirken hata oluştu: ' + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [ticketId, bookingId, sessionTime, hall, full, student, isGuest, prices]);

  useEffect(() => {
    if (notification.message && notification.type === 'success') {
      console.log('Payment: Notification set:', notification);
      const timer = setTimeout(() => {
        console.log('Payment: Auto-closing notification and redirecting');
        if (user) {
          console.log('Payment: Redirecting to /account/tickets for user=', user.uid);
          router.push('/account/tickets');
        } else if (ticketData?.isGuest) {
          console.log('Payment: Redirecting to / for guest');
          router.push('/');
        }
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, user, ticketData, router]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      console.log('Payment: Attempting payment with:', {
        ticketId,
        bookingId,
        sessionTime,
        hall,
        ticketData,
      });

      const missingParams = [];
      if (!ticketId) missingParams.push('ticketId');
      if (!bookingId) missingParams.push('bookingId');
      if (!sessionTime) missingParams.push('sessionTime');
      if (!hall) missingParams.push('hall');
      if (!ticketData || !ticketData.totalPrice) missingParams.push('ticketData or totalPrice');

      if (missingParams.length > 0) {
        throw new Error(`Ödeme bilgileri eksik: ${missingParams.join(', ')}`);
      }

      if (!user && !ticketData.isGuest) {
        throw new Error('Kullanıcı kimliği doğrulanmadı. Lütfen giriş yapın.');
      }

      await runTransaction(db, async (transaction) => {
        const seatDocId = `${ticketData.movieId}_${ticketData.cinemaId}_${encodeURIComponent(sessionTime)}`;
        console.log('Payment: seatDocId=', seatDocId, 'bookingId=', bookingId, 'seats=', ticketData.seats);
        const seatRef = doc(db, 'cinema_seats', seatDocId);
        const seatSnap = await transaction.get(seatRef);
        const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };
        console.log('Payment: Firestore seatData.seats=', seatData.seats);

        const invalidSeats = ticketData.seats.filter((seatId) => {
          const status = seatData.seats[seatId];
          console.log(`Payment: Validating seat ${seatId}: status=${status}, expected=locked_${bookingId} or available`);
          return status && status !== `locked_${bookingId}` && status !== 'available';
        });

        if (invalidSeats.length > 0) {
          console.error('Payment: Invalid seats=', invalidSeats, 'expected=locked_' + bookingId);
          throw new Error(`Seçtiğiniz koltuklar artık mevcut değil: ${invalidSeats.join(', ')}`);
        }

        const updatedSeats = { ...seatData.seats };
        ticketData.seats.forEach((seatId) => {
          updatedSeats[seatId] = `booked_${ticketId}`;
          console.log(`Payment: Marking seat ${seatId} as booked_${ticketId}`);
        });

        const ticketRef = doc(db, ticketData.isGuest ? 'guestTickets' : 'tickets', ticketId);
        transaction.set(ticketRef, { status: 'completed' }, { merge: true });

        const paymentId = doc(collection(db, 'payments')).id;
        const paymentData = {
          ticketId,
          totalPrice: ticketData.totalPrice,
          timestamp: serverTimestamp(),
          status: 'completed',
          userId: user ? user.uid : null,
          isGuest,
          sessionTime,
          hall,
          movieId: ticketData.movieId,
          cinemaId: ticketData.cinemaId,
        };
        transaction.set(doc(db, 'payments', paymentId), paymentData);

        transaction.set(seatRef, { seats: updatedSeats, lockTimestamp: serverTimestamp() }, { merge: true });
      });

      console.log('Payment: Payment successful, ticketId=', ticketId);
      setNotification({ message: 'Ödeme başarılı! Biletiniz hazır.', type: 'success' });
    } catch (err) {
      console.error('Payment: Payment error:', err);
      setNotification({ message: `Ödeme işlemi başarısız: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    console.log('Payment: Notification closed manually');
    if (notification.type === 'success') {
      if (user) {
        console.log('Payment: Redirecting to /account/tickets for user=', user.uid);
        router.push('/account/tickets');
      } else if (ticketData?.isGuest) {
        console.log('Payment: Redirecting to / for guest');
        router.push('/');
      }
    }
    setNotification({ message: '', type: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-[#6b46c1] to-[#8e5cf5] rounded-lg shadow-lg flex items-center justify-center"
            animate={{ rotateY: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2h6v2H9V2zm0 4h6v2H9V6zm0 4h6v2H9v-2zm0 4h6v2H9v-2zm0 4h6v2H9v-2zM5 2H3v20h2V2zm16 0h-2v20h2V2zm-6 0h-2v20h2V2z" />
            </svg>
          </motion.div>
          <motion.p
            className="text-white text-xl font-medium font-cinematic"
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Ödeme bilgileri yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="text-center bg-[#2a2a3d]/20 backdrop-blur-lg p-8 rounded-xl border border-[#6b46c1]/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 font-cinematic">Hata oluştu</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <motion.button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-[#6b46c1] to-[#8e5cf5] hover:from-[#553c9a] hover:to-[#7b4ded] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-[#6b46c1]/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ana Sayfaya Dön
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const totalTickets = (ticketData?.fullCount || 0) + (ticketData?.studentCount || 0);
  const calculatedTotalPrice = (ticketData?.fullCount || 0) * prices.full + (ticketData?.studentCount || 0) * prices.student;

  console.log('Payment: ticketData.totalPrice=', ticketData?.totalPrice, 'calculatedTotalPrice=', calculatedTotalPrice);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-6 py-12 overflow-hidden font-cinematic">
      <div className="fixed inset-0 z-[-2]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] opacity-80"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-[#6b46c1]/20 to-[#8e5cf5]/20 opacity-50"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} glareEnable={true} glareMaxOpacity={0.5} glareColor="#8e5cf5">
          <motion.div
            className="text-center mb-12 bg-[#2a2a3d]/50 backdrop-blur-xl p-8 rounded-2xl border border-[#6b46c1]/30 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6b46c1] via-[#8e5cf5] to-[#a855f7]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Ödeme İşlemi
            </motion.h1>
            <motion.div
              className="w-40 h-1.5 bg-gradient-to-r from-[#6b46c1] via-[#8e5cf5] to-[#a855f7] rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-xl text-[#d1d5db]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Son adımı tamamlayın
            </motion.p>
          </motion.div>
        </Tilt>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <motion.div
              className="bg-[#2a2a3d] rounded-xl p-6 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-semibold text-[#8e5cf5] mb-4 flex items-center">
                <span className="mr-3">🎥</span> Film Bilgileri
              </h3>
              <div className="flex gap-6">
                <div className="bg-gradient-to-br from-[#6b46c1]/20 to-[#8e5cf5]/20 p-2 rounded-xl">
                  <img
                    src={filmData?.imgSrc || 'https://via.placeholder.com/128x192'}
                    alt="Film Posteri"
                    className="w-32 h-48 object-cover rounded-lg border-2 border-[#8e5cf5]"
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#e5e7eb]">{filmData?.title || 'Film Adı'}</p>
                  <p className="text-lg text-[#d1d5db]">{filmData?.duration || '0'} dk • {filmData?.genre || 'Tür'} • {filmData?.rating || 'Yaş Sınırı'}</p>
                  <p className="text-lg text-[#d1d5db] mt-2">{showtime}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#2a2a3d] rounded-xl p-6 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-semibold text-[#8e5cf5] mb-4 flex items-center">
                <span className="mr-3">🏠</span> Sinema Bilgileri
              </h3>
              <p className="text-xl text-[#e5e7eb]">{cinemaData?.name || 'Sinema Adı'}</p>
              <p className="text-lg text-[#9ca3af] mt-2">
                <a href={cinemaData?.location || '#'} target="_blank" rel="noopener noreferrer" className="text-[#8e5cf5] hover:underline">
                  Konumu Görüntüle
                </a>
              </p>
            </motion.div>

            <motion.div
              className="bg-[#2a2a3d] rounded-xl p-6 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-semibold text-[#8e5cf5] mb-4 flex items-center">
                <span className="mr-3">🎫</span> Koltuk Bilgileri
              </h3>
              <p className="text-xl text-[#e5e7eb]">Salon: {ticketData?.hall || 'Salon Bilinmiyor'}</p>
              <p className="text-xl text-[#e5e7eb] mt-2">Koltuk: {ticketData?.seats?.join(', ') || 'Koltuk'}</p>
              <p className="text-xl text-[#e5e7eb] mt-2">
                Bilet Türü: {ticketData?.fullCount || 0} Tam Bilet
                {ticketData?.studentCount > 0 && `, ${ticketData?.studentCount} Öğrenci Bilet`}
              </p>
              <p className="text-xl text-[#e5e7eb] mt-2">
                {totalTickets} Bilet Toplam: {calculatedTotalPrice.toFixed(2)} ₺
              </p>
            </motion.div>

            {!user && ticketData?.isGuest && (
              <motion.div
                className="bg-[#2a2a3d] rounded-xl p-6 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-2xl font-semibold text-[#8e5cf5] mb-4 flex items-center">
                  <span className="mr-3">👥</span> Misafir Bilgileri
                </h3>
                {ticketData.guestInfo ? (
                  <p className="text-xl text-[#e5e7eb]">
                    Ad Soyad: {ticketData.guestInfo.fullName || 'Bilinmiyor'}<br />
                    E-posta: {ticketData.guestInfo.email || 'Bilinmiyor'}<br />
                    Telefon: {ticketData.guestInfo.phoneNumber || 'Bilinmiyor'}
                  </p>
                ) : (
                  <p className="text-xl text-red-400">
                    Misafir bilgileri bulunamadı. Lütfen koltuk seçim adımını tekrar deneyin.
                  </p>
                )}
              </motion.div>
            )}
          </div>

          <motion.div
            className="bg-[#2a2a3d] rounded-xl p-4 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-2xl font-semibold text-[#8e5cf5] mb-4 flex items-center justify-center">
              <span className="mr-3">💳</span> Ödeme Özeti
            </h3>
            <div className="space-y-2 text-[#e5e7eb] text-lg">
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Toplam Bilet</p>
                <p>{totalTickets} Adet</p>
              </div>
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Tam Bilet</p>
                <p>{ticketData?.fullCount || 0} x {prices.full.toFixed(2)} ₺</p>
              </div>
              {ticketData?.studentCount > 0 && (
                <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                  <p className="font-medium">Öğrenci Bilet</p>
                  <p>{ticketData?.studentCount} x {prices.student.toFixed(2)} ₺</p>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Ara Toplam</p>
                <p>{calculatedTotalPrice.toFixed(2)} ₺</p>
              </div>
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Hizmet Bedeli</p>
                <p>0 ₺</p>
              </div>
              <div className="flex justify-between py-2 font-bold text-xl text-[#8e5cf5]">
                <p>GENEL TOPLAM</p>
                <p>{calculatedTotalPrice.toFixed(2)} ₺</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <motion.button
                onClick={handlePayment}
                className="bg-gradient-to-r from-[#6b46c1] to-[#8e5cf5] hover:from-[#553c9a] hover:to-[#7b4ded] text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-[#6b46c1]/30 transition-all duration-300 w-full"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                  </span>
                ) : (
                  'Ödemeyi Tamamla'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {notification.message && (
            <motion.div
              key={notification.message}
              className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border border-[#6b46c1]/30 max-w-sm w-full z-[2000] notification
                ${notification.type === 'success' ? 'bg-gradient-to-r from-[#6b46c1]/80 to-[#8e5cf5]/80' : 'bg-gradient-to-r from-red-600/80 to-red-800/80'}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center gap-4">
                {notification.type === 'success' ? (
                  <motion.svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                )}
                <span className="text-lg font-medium text-white">{notification.message}</span>
              </div>
              <motion.button
                onClick={handleNotificationClose}
                className="absolute top-2 right-2 text-white hover:text-gray-200"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}