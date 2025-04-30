'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';

const TOTAL_ROWS = 6;
const SEATS_PER_ROW = 8;
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

const generateSeats = () => {
  const seats = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row = [];
    for (let s = 1; s <= SEATS_PER_ROW; s++) {
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

export default function SeatSelection() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');
  const bookingId = searchParams.get('booking');
  const fullCount = parseInt(searchParams.get('full') || '0');
  const studentCount = parseInt(searchParams.get('student') || '0');
  const ticketCount = fullCount + studentCount;

  const [seats, setSeats] = useState(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(LOCK_TIMEOUT_MS / 1000);

  const seatDocId = `${movieId}_${cinemaId}`;

  useEffect(() => {
    const docRef = doc(db, 'cinema_seats', seatDocId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const newSeats = generateSeats();
      const occupiedMap = docSnap.exists() ? docSnap.data()?.seats || {} : {};

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

      setSeats(newSeats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [seatDocId]);

  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) {
      alert('Süre doldu! Lütfen koltuk seçimini yeniden yapın.');
      router.replace(`/tickets/select-seat?movie=${movieId}&cinema=${cinemaId}&booking=${bookingId}&full=${fullCount}&student=${studentCount}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  useEffect(() => {
    const unlockSeats = async () => {
      if (selectedSeats.length > 0) {
        const seatRef = doc(db, 'cinema_seats', seatDocId);
        const seatSnap = await getDoc(seatRef);
        const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };

        const updatedSeats = { ...seatData.seats };
        selectedSeats.forEach((seatId) => {
          updatedSeats[seatId] = 'available';
        });

        await setDoc(seatRef, { seats: updatedSeats }, { merge: true });
      }
    };

    window.addEventListener('beforeunload', unlockSeats);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') unlockSeats();
    });

    return () => {
      window.removeEventListener('beforeunload', unlockSeats);
      document.removeEventListener('visibilitychange', unlockSeats);
    };
  }, [selectedSeats, seatDocId]);

  const handleSelect = (rowIndex, seatIndex) => {
    const seatId = seats[rowIndex][seatIndex].id;

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

    const seatRef = doc(db, 'cinema_seats', seatDocId);
    const seatSnap = await getDoc(seatRef);
    const seatData = seatSnap.exists() ? seatSnap.data() : { seats: {} };

    const updatedSeats = { ...seatData.seats };
    selectedSeats.forEach((seatId) => {
      updatedSeats[seatId] = `locked_${bookingId}`;
    });

    await setDoc(seatRef, { seats: updatedSeats }, { merge: true });

    router.push(
      `/tickets/payment?movie=${movieId}&cinema=${cinemaId}&booking=${bookingId}&seats=${selectedSeats.join(',')}&full=${fullCount}&student=${studentCount}`
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Koltuk Seçimi</h1>

      <div className="bg-white w-3/5 h-8 rounded-b-xl shadow mb-6 text-center text-black font-semibold">
        <span className="text-sm">PERDE</span>
      </div>

      <div className="mb-6 bg-purple-800 text-white py-2 px-6 rounded-full shadow text-lg font-semibold">
        Kalan Süre: {formatTime(timeLeft)}
      </div>

      {loading ? (
        <motion.div className="text-gray-300 text-lg">Koltuklar yükleniyor...</motion.div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
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

                  return (
                    <motion.button
                      key={seat.id}
                      onClick={() => handleSelect(rowIndex, seatIndex)}
                      className={`w-10 h-10 text-xs rounded-t-md font-semibold
                        ${
                          seatState === 'booked'
                            ? 'bg-gray-500 cursor-not-allowed'
                            : seatState === 'locked'
                            ? 'bg-red-400 cursor-not-allowed'
                            : seatState === 'selected'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 hover:bg-purple-700'
                        }`}
                      disabled={seatState === 'booked' || seatState === 'locked'}
                      title={tooltip}
                      animate={
                        seat.justBooked
                          ? { scale: [1, 1.3, 1], opacity: [0.7, 1] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {seat.id}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-10 flex gap-6 text-sm items-center flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-purple-600" />
              <span>Seçilen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-gray-700" />
              <span>Boş</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-red-400" />
              <span>Kilitli</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-gray-500" />
              <span>Dolu</span>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-lg">
                Seçilen Koltuklar: <strong>{selectedSeats.join(', ')}</strong>
              </p>
              <button
                className="mt-4 bg-[#a020f0] px-6 py-2 rounded-full font-semibold text-white hover:bg-purple-700 transition"
                onClick={handleContinue}
              >
                Devam Et
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
