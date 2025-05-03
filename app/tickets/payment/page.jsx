'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const full = parseInt(searchParams.get('full') || '0');
  const student = parseInt(searchParams.get('student') || '0');

  const [ticketData, setTicketData] = useState(null);
  const [filmData, setFilmData] = useState(null);
  const [cinemaData, setCinemaData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [user, setUser] = useState(null);
  const [showtime, setShowtime] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('Kullanıcı durumu:', currentUser ? currentUser.uid : 'Kimliksiz');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log('URL parametreleri:', { ticketId, full, student });

    const fetchData = async () => {
      try {
        if (!ticketId) {
          setError('Bilet bilgisi eksik. Lütfen koltuk seçim adımından tekrar deneyin.');
          setLoading(false);
          return;
        }

        if (full + student <= 0) {
          setError('Bilet sayısı geçersiz. En az 1 bilet seçmelisiniz.');
          setLoading(false);
          return;
        }

        console.log('Bilet aranıyor, ticketId:', ticketId);
        let ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
        let isGuest = false;
        if (!ticketDoc.exists()) {
          console.log('tickets koleksiyonunda bulunamadı, guestTickets kontrol ediliyor...');
          ticketDoc = await getDoc(doc(db, 'guestTickets', ticketId));
          isGuest = true;
        }

        console.log('Ticket document:', ticketDoc.exists() ? ticketDoc.data() : 'Not found', 'isGuest:', isGuest);

        if (!ticketDoc.exists()) {
          setError('Bilet bulunamadı. Lütfen koltuk seçim adımından tekrar deneyin.');
          setLoading(false);
          return;
        }

        const ticket = ticketDoc.data();
        setTicketData({ ...ticket, isGuest });
        console.log('ticketData ayarlandı:', { ...ticket, isGuest });

        const filmDoc = await getDoc(doc(db, 'films', ticket.movieId));
        if (filmDoc.exists()) {
          const film = filmDoc.data();
          setFilmData(film);

          const cinemaInfo = film.cinemas?.find(cinema => cinema.id === ticket.cinemaId);
          if (cinemaInfo && cinemaInfo.showtime) {
            setShowtime(new Date(cinemaInfo.showtime).toLocaleString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }));
          } else {
            setShowtime('Seans Bilinmiyor');
          }
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

        setLoading(false);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError('Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    };
    fetchData();
  }, [ticketId, full, student]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (!ticketData || !ticketData.totalPrice || !ticketId) {
        throw new Error('Ödeme bilgileri eksik.');
      }

      if (!user && !ticketData.isGuest) {
        throw new Error('Kullanıcı kimliği doğrulanmadı. Lütfen giriş yapın.');
      }

      const seatDocId = `${ticketData.movieId}_${ticketData.cinemaId}`;
      const seatRef = doc(db, 'cinema_seats', seatDocId);
      const seatSnap = await getDoc(seatRef);
      const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };
      const updatedSeats = { ...seatData.seats };

      ticketData.seats.forEach((seatId) => {
        if (updatedSeats[seatId]?.startsWith('locked_')) {
          updatedSeats[seatId] = `booked_${ticketId}`;
        }
      });

      await setDoc(seatRef, { seats: updatedSeats }, { merge: true });

      const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const paymentData = {
        ticketId,
        totalPrice: ticketData.totalPrice,
        timestamp: serverTimestamp(),
        status: 'completed',
        userId: user ? user.uid : null,
      };
      await setDoc(doc(db, 'payments', paymentId), paymentData);

      const ticketRef = doc(db, ticketData.isGuest ? 'guestTickets' : 'tickets', ticketId);
      await setDoc(ticketRef, { status: 'completed' }, { merge: true });

      setNotification({ message: 'Ödeme başarılı! Biletiniz hazır.', type: 'success' });
      setLoading(false);
    } catch (err) {
      console.error('Ödeme hatası:', err);
      setNotification({ message: `Ödeme işlemi başarısız: ${err.message}`, type: 'error' });
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    if (notification.type === 'success') {
      if (user) {
        router.push('/account/tickets');
      } else if (ticketData?.isGuest) {
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
            <svg
              className="w-12 h-12 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
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
          >
            Ana Sayfaya Dön
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const totalTickets = (ticketData?.fullCount || 0) + (ticketData?.studentCount || 0);
  const ticketPrice = ticketData?.totalPrice / totalTickets || 0;

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
              <p className="text-xl text-[#e5e7eb]">Salon: {cinemaData?.halls?.[0] || 'Salon'}</p>
              <p className="text-xl text-[#e5e7eb] mt-2">Koltuk: {ticketData?.seats?.join(', ') || 'Koltuk'}</p>
              <p className="text-xl text-[#e5e7eb] mt-2">
                Bilet Türü: {ticketData?.fullCount || 0} Tam Bilet
                {ticketData?.studentCount > 0 && `, ${ticketData?.studentCount} Öğrenci Bilet`}
              </p>
              <p className="text-xl text-[#e5e7eb] mt-2">
                {totalTickets} x {ticketPrice.toFixed(2)} ₺ = {ticketData?.totalPrice || 0} ₺
              </p>
            </motion.div>

            {!user && ticketData?.isGuest && (
              <motion.div
                className="bg-[#2a2a3d] rounded-xl p-6 shadow-lg border border-[#6b46c1]/30 hover:shadow-[#8e5cf5]/30 transition-all duration-300 md:col-span-2"
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
                <p>{ticketData?.fullCount || 0} x {ticketPrice.toFixed(2)} ₺</p>
              </div>
              {ticketData?.studentCount > 0 && (
                <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                  <p className="font-medium">Öğrenci Bilet</p>
                  <p>{ticketData?.studentCount} x {ticketPrice.toFixed(2)} ₺</p>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Ara Toplam</p>
                <p>{ticketData?.totalPrice || 0} ₺</p>
              </div>
              <div className="flex justify-between py-1 border-b border-[#6b46c1]/30">
                <p className="font-medium">Hizmet Bedeli</p>
                <p>0 ₺</p>
              </div>
              <div className="flex justify-between py-2 font-bold text-xl text-[#8e5cf5]">
                <p>GENEL TOPLAM</p>
                <p>{ticketData?.totalPrice || 0} ₺</p>
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
                  "Ödemeyi Tamamla"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {notification.message && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`p-6 rounded-xl shadow-lg border text-center ${
                notification.type === 'success'
                  ? 'bg-[#2a2a3d] border-[#6b46c1]/30'
                  : 'bg-red-500/20 border-red-500/30'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p
                className={`text-lg font-medium mb-4 ${
                  notification.type === 'success' ? 'text-[#8e5cf5]' : 'text-red-300'
                }`}
              >
                {notification.message}
              </p>
              <motion.button
                onClick={handleNotificationClose}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                  notification.type === 'success'
                    ? 'bg-gradient-to-r from-[#6b46c1] to-[#8e5cf5] hover:from-[#553c9a] hover:to-[#7b4ded] text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tamam
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');

        .font-cinematic {
          font-family: 'Montserrat', sans-serif;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0d0d1a;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6b46c1, #8e5cf5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}