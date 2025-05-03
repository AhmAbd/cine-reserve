'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip';
import Tilt from 'react-parallax-tilt';

const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

const generateSeats = (totalSeats = 48) => {
  const seatsPerRow = 8;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const seats = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let s = 1; s <= seatsPerRow; s++) {
      const seatNumber = r * seatsPerRow + s;
      if (seatNumber > totalSeats) break;
      row.push({
        id: `${String.fromCharCode(65 + r)}${s}`,
        occupied: false,
        booked: false,
        justBooked: false,
      });
    }
    seats.push(row);
  }

  return seats;
};

const SeatIcon = ({ state, seatId }) => {
  const colors = {
    selected: { backrest: '#8b5cf6', cushion: '#7c3aed', armrest: '#6d28d9', text: 'white' },
    available: { backrest: '#374151', cushion: '#4b5563', armrest: '#3f4a5a', text: '#d1d5db' },
    locked: { backrest: '#ef4444', cushion: '#dc2626', armrest: '#b91c1c', text: '#fee2e2' },
    booked: { backrest: '#5b21b6', cushion: '#4c1d95', armrest: '#3b1680', text: '#e9d5ff' }
  };

  const current = colors[state] || colors.available;

  return (
    <div className="relative">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="8" width="24" height="12" rx="2" fill={current.backrest} />
        <rect x="12" y="8" width="24" height="4" fill="url(#backrestShade)" />
        <rect x="10" y="20" width="28" height="16" rx="2" fill={current.cushion} />
        <rect x="10" y="20" width="28" height="4" fill="url(#cushionShade)" />
        <rect x="8" y="20" width="2" height="12" rx="1" fill={current.armrest} />
        <rect x="38" y="20" width="2" height="12" rx="1" fill={current.armrest} />
        <text x="24" y="32" fill={current.text} fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          {seatId}
        </text>
        <defs>
          <linearGradient id="backrestShade" x1="12" y1="8" x2="12" y2="12">
            <stop stopColor="black" stopOpacity="0.3"/>
            <stop offset="1" stopColor="black" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="cushionShade" x1="10" y1="20" x2="10" y2="24">
            <stop stopColor="black" stopOpacity="0.3"/>
            <stop offset="1" stopColor="black" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
      {state === 'selected' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-white z-10"></div>}
      {state === 'locked' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white z-10"></div>}
    </div>
  );
};

export default function SeatSelection() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');
  const bookingId = searchParams.get('booking');
  const fullCount = parseInt(searchParams.get('full') || '0');
  const studentCount = parseInt(searchParams.get('student') || '0');
  const isGuest = searchParams.get('guest') === 'true';
  const ticketCount = fullCount + studentCount;

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(LOCK_TIMEOUT_MS / 1000);
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phoneNumber: '' });
  const [user, setUser] = useState(null);
  const [lockingSeats, setLockingSeats] = useState(false);
  const seatDocId = `${movieId}_${cinemaId}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const cinemaSnap = await getDoc(doc(db, 'cinemas', cinemaId));
        const seatCount = cinemaSnap.exists() ? cinemaSnap.data().seats || 48 : 48;
        const docRef = doc(db, 'cinema_seats', seatDocId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          console.log('Firestore snapshot received:', docSnap.exists() ? docSnap.data() : 'No data');
          const occupiedMap = docSnap.exists() ? docSnap.data()?.seats || {} : {};
          const newSeats = generateSeats(seatCount);

          newSeats.forEach((row) => {
            row.forEach((seat) => {
              const value = occupiedMap[seat.id];
              if (typeof value === 'string') {
                if (value.startsWith('booked_')) {
                  seat.occupied = true;
                  seat.booked = true;
                  seat.justBooked = true;
                } else if (value.startsWith('locked_')) {
                  seat.occupied = true;
                  seat.booked = false;
                }
              }
            });
          });

          console.log('Updated seats state:', newSeats);
          setSeats(newSeats);
          setLoading(false);
        }, (err) => {
          console.error('Snapshot error:', err);
          setError('Koltuk bilgileri yüklenirken bir hata oluştu: ' + err.message);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Koltuk bilgileri yüklenirken bir hata oluştu: ' + err.message);
        setLoading(false);
      }
    };

    fetchAndSubscribe();
  }, [seatDocId, cinemaId]);

  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) {
      alert('Süre doldu! Lütfen koltuk seçimini yeniden yapın.');
      router.replace(`/tickets/select-seat?movie=${movieId}&cinema=${cinemaId}&booking=${bookingId}&full=${fullCount}&student=${studentCount}&guest=${isGuest}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, router, movieId, cinemaId, bookingId, fullCount, studentCount, isGuest]);

  useEffect(() => {
    const cleanupSeats = async () => {
      if (selectedSeats.length > 0) {
        try {
          const seatRef = doc(db, 'cinema_seats', seatDocId);
          const seatSnap = await getDoc(seatRef);
          const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };

          const updatedSeats = { ...seatData.seats };
          selectedSeats.forEach((seatId) => {
            if (updatedSeats[seatId]?.startsWith(`locked_${bookingId}`)) {
              updatedSeats[seatId] = 'available';
            }
          });

          await setDoc(seatRef, { seats: updatedSeats }, { merge: true });
          console.log('Seats cleaned up:', selectedSeats);
        } catch (err) {
          console.error('Cleanup seats error:', err);
        }
      }
    };

    window.addEventListener('beforeunload', cleanupSeats);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') cleanupSeats();
    });

    const timeout = setTimeout(cleanupSeats, LOCK_TIMEOUT_MS);

    return () => {
      window.removeEventListener('beforeunload', cleanupSeats);
      document.removeEventListener('visibilitychange', cleanupSeats);
      clearTimeout(timeout);
    };
  }, [selectedSeats, seatDocId, bookingId]);

  const handleSelect = (rowIndex, seatIndex) => {
    const seatId = seats[rowIndex][seatIndex].id;
    console.log('Seat selected:', seatId, 'Current state:', seats[rowIndex][seatIndex]);

    if (selectedSeats.length >= ticketCount && !selectedSeats.includes(seatId)) {
      alert(`En fazla ${ticketCount} koltuk seçebilirsiniz.`);
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
    } else {
      setSelectedSeats((prev) => [...prev, seatId]);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length !== ticketCount) {
      alert(`Lütfen tam olarak ${ticketCount} koltuk seçin.`);
      return;
    }

    if (isGuest && (!guestInfo.fullName || !guestInfo.email || !guestInfo.phoneNumber)) {
      alert('Lütfen misafir bilgilerini doldurun.');
      return;
    }

    try {
      setLockingSeats(true);
      const seatRef = doc(db, 'cinema_seats', seatDocId);
      const seatSnap = await getDoc(seatRef);
      const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };
      console.log('Firestore seat data before locking:', seatData);

      // Validate that selected seats are still available
      const invalidSeats = selectedSeats.filter((seatId) => {
        const status = seatData.seats[seatId];
        return status && (status.startsWith('booked_') || status.startsWith('locked_'));
      });

      if (invalidSeats.length > 0) {
        alert('Seçtiğiniz bazı koltuklar artık mevcut değil. Lütfen yeniden seçim yapın.');
        setSelectedSeats([]);
        setLockingSeats(false);
        return;
      }

      const updatedSeats = { ...seatData.seats };
      selectedSeats.forEach((seatId) => {
        updatedSeats[seatId] = `locked_${bookingId}`;
      });

      await setDoc(seatRef, { seats: updatedSeats, lockTimestamp: serverTimestamp() }, { merge: true });
      console.log('Seats locked in Firestore:', selectedSeats);

      // Update local seats state to reflect locked status
      setSeats((prevSeats) =>
        prevSeats.map((row) =>
          row.map((seat) => {
            if (selectedSeats.includes(seat.id)) {
              return { ...seat, occupied: true, booked: false };
            }
            return seat;
          })
        )
      );
      setLockingSeats(false);

      // Films koleksiyonundan seans bilgisini al
      const filmRef = doc(db, 'films', movieId);
      const filmSnap = await getDoc(filmRef);
      let sessionInfo = 'Seans Bilinmiyor';
      let filmData = {};

      if (filmSnap.exists()) {
        filmData = filmSnap.data();
        // Örnek: sessions alanı bir dizi ve cinemaId ile eşleşen seansı buluyoruz
        const sessions = filmData.sessions || [];
        const matchingSession = sessions.find(
          (session) => session.cinemaId === cinemaId && session.hallNumber === searchParams.get('hall')
        );

        if (matchingSession) {
          sessionInfo = `${matchingSession.hallNumber} - ${new Date(matchingSession.showtime).toLocaleString()}`;
        }
      }

      const ticketId = `TICK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const ticketData = {
        cinemaId,
        cinemaName: (await getDoc(doc(db, 'cinemas', cinemaId))).data()?.name || 'Sinema Adı Bilinmiyor',
        fullCount,
        movieId,
        movieName: filmData?.title || 'Film Adı Bilinmiyor',
        session: sessionInfo, // Güncellenmiş seans bilgisi
        studentCount,
        seats: selectedSeats,
        timestamp: serverTimestamp(),
        totalPrice: fullCount * 195 + studentCount * 150,
        status: 'pending',
        bookingId,
      };

      if (isGuest) {
        await setDoc(doc(db, 'guestTickets', ticketId), {
          ...ticketData,
          guestInfo: {
            fullName: guestInfo.fullName,
            email: guestInfo.email,
            phoneNumber: guestInfo.phoneNumber,
          },
        });
      } else {
        await setDoc(doc(db, 'tickets', ticketId), {
          ...ticketData,
          userId: user?.uid || null,
        });
      }

      router.push(`/tickets/payment?ticketId=${ticketId}&full=${fullCount}&student=${studentCount}&bookingId=${bookingId}`);
    } catch (err) {
      console.error('Seat selection error:', err);
      setError('Koltuk seçimi sırasında bir hata oluştu: ' + err.message);
      setLockingSeats(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex justify-center items-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <motion.button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ana Sayfaya Dön
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden">
      <div className="fixed inset-0 z-[-2]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] opacity-80"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-indigo-900/20 opacity-50"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareColor="#a020f0">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 font-cinematic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Koltuk Seçimi
            </motion.h1>
            <motion.div
              className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-lg text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-purple-300 font-bold">{ticketCount}</span> koltuk seçin
              <span className="mx-2">•</span>
              Kalan süre: 
              <span className={`ml-1 font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </motion.p>
          </motion.div>
        </Tilt>

        <motion.div
          className="relative w-full h-16 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl shadow-inner flex items-center justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-gray-800 font-bold text-lg tracking-wider drop-shadow-lg">PERDE</span>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 rounded-b-xl" />
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-yellow-400/20 blur-sm"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full"></div>
              <p className="text-gray-400">Koltuklar yükleniyor...</p>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <div>
              <div className="flex flex-col items-center gap-3">
                {seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {row.map((seat, seatIndex) => {
                      const isSelected = selectedSeats.includes(seat.id);
                      let seatState = 'available';
                      let tooltip = 'Boş Koltuk';

                      if (seat.occupied) {
                        if (seat.booked) {
                          seatState = 'booked';
                          tooltip = 'Dolu: Rezerve Edildi';
                        } else {
                          seatState = 'locked';
                          tooltip = 'Kilitli: Başka Kullanıcı Seçti';
                        }
                      } else if (isSelected) {
                        seatState = 'selected';
                        tooltip = 'Seçilen Koltuk';
                      }

                      const isDisabled = seatState === 'booked' || seatState === 'locked';

                      return (
                        <Tooltip key={seat.id}>
                          <TooltipTrigger asChild>
                            <motion.button
                              onClick={() => handleSelect(rowIndex, seatIndex)}
                              disabled={isDisabled}
                              className="relative"
                              whileHover={!isDisabled ? { scale: 1.1 } : {}}
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                              animate={seat.justBooked ? { scale: [1, 1.2, 1], opacity: [0.7, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <SeatIcon state={seatState} seatId={seat.id} />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 border border-gray-700 text-white">
                            <p>{seat.id}: {tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>

              <motion.div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {[
                  { state: 'selected', color: 'bg-purple-500', label: 'Seçilen' },
                  { state: 'available', color: 'bg-gray-500', label: 'Boş' },
                  { state: 'locked', color: 'bg-red-500', label: 'Kilitli' },
                  { state: 'booked', color: 'bg-purple-800', label: 'Dolu' },
                ].map((item) => (
                  <div key={item.state} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className={`w-4 h-4 rounded-sm ${item.color}`}></div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <AnimatePresence>
                {selectedSeats.length > 0 && (
                  <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
                    <Card className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 border-gray-700 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                          Seçim Özeti
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Koltuklar</p>
                            <p className="font-medium">{selectedSeats.join(', ')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Tam Bilet</p>
                            <p className="font-medium">{fullCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Öğrenci Bilet</p>
                            <p className="font-medium">{studentCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Toplam</p>
                            <p className="font-medium">{ticketCount} koltuk</p>
                          </div>
                        </div>
                        {(!user || isGuest) && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Ad Soyad"
                              value={guestInfo.fullName}
                              onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                              type="email"
                              placeholder="E-posta"
                              value={guestInfo.email}
                              onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                              type="phoneNumber"
                              placeholder="Telefon Numarası"
                              value={guestInfo.phoneNumber}
                              onChange={(e) => setGuestInfo({ ...guestInfo, phoneNumber: e.target.value })}
                              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        )}
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-base font-bold shadow-lg hover:shadow-purple-500/40 mt-4"
                          onClick={handleContinue}
                        >
                          Ödemeye Geç
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}