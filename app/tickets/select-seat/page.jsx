'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

const TOTAL_ROWS = 6;
const SEATS_PER_ROW = 8;
const LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const generateSeats = () => {
  const seats = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row = [];
    for (let s = 1; s <= SEATS_PER_ROW; s++) {
      row.push({
        id: `${String.fromCharCode(65 + r)}${s}`,
        occupied: false,
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

  const seatDocId = `${movieId}_${cinemaId}`;

  // Load and clean expired seat locks
  useEffect(() => {
    const loadOccupiedSeats = async () => {
      const docRef = doc(db, 'cinema_seats', seatDocId);
      const docSnap = await getDoc(docRef);
      const newSeats = generateSeats();

      if (docSnap.exists()) {
        const data = docSnap.data();
        const occupiedMap = data?.seats || {};
        const now = Date.now();
        let changed = false;

        newSeats.forEach((row) => {
          row.forEach((seat) => {
            const lock = occupiedMap[seat.id];
            if (lock?.occupied) {
              const age = now - (lock.lockedAt || 0);
              if (age > LOCK_TIMEOUT_MS) {
                delete occupiedMap[seat.id];
                changed = true;
              } else {
                seat.occupied = true;
              }
            }
          });
        });

        // Save cleaned-up data if any changes
        if (changed) {
          await setDoc(docRef, { seats: occupiedMap }, { merge: true });
        }
      }

      setSeats(newSeats);
      setLoading(false);
    };

    loadOccupiedSeats();
  }, [seatDocId]);

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

    const docRef = doc(db, 'cinema_seats', seatDocId);
    const docSnap = await getDoc(docRef);
    const current = docSnap.exists() ? docSnap.data()?.seats || {} : {};

    // Double-check no one took the seats meanwhile
    for (const seatId of selectedSeats) {
      if (current[seatId]?.occupied) {
        alert(`Koltuk ${seatId} zaten rezerve edilmiş.`);
        return;
      }
    }

    const updatedSeats = { ...current };
    const now = Date.now();

    selectedSeats.forEach((seatId) => {
      updatedSeats[seatId] = {
        occupied: true,
        bookingId,
        lockedAt: now,
      };
    });

    await setDoc(docRef, { seats: updatedSeats }, { merge: true });

    router.push(
      `/tickets/payment?movie=${movieId}&cinema=${cinemaId}&booking=${bookingId}&seats=${selectedSeats.join(',')}&full=${fullCount}&student=${studentCount}`
    );
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Koltuk Seçimi</h1>

      <div className="bg-white w-3/5 h-8 rounded-b-xl shadow mb-10 text-center text-black font-semibold">
        <span className="text-sm">PERDE</span>
      </div>

      {loading ? (
        <p className="text-gray-300 text-lg">Koltuklar yükleniyor...</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((seat, seatIndex) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSelect(rowIndex, seatIndex)}
                      className={`w-10 h-10 text-xs rounded-t-md transition-all font-semibold
                        ${
                          seat.occupied
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 hover:bg-purple-700'
                        }`}
                      disabled={seat.occupied}
                    >
                      {seat.id}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-6 text-sm items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-purple-600" />
              <span>Seçilen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-gray-700" />
              <span>Boş</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-t-md bg-gray-400" />
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

          {selectedSeats.length === 0 && ticketCount > 0 && (
            <div className="text-center text-red-500 mt-4">
              En fazla {ticketCount} koltuk seçebilirsiniz.
            </div>
          )}
        </>
      )}
    </div>
  );
}
