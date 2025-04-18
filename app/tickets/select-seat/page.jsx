'use client';

import { useState } from 'react';

const TOTAL_ROWS = 6;
const SEATS_PER_ROW = 8;

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
  const [seats, setSeats] = useState(generateSeats());
  const [selected, setSelected] = useState(null);

  const handleSelect = (rowIndex, seatIndex) => {
    const id = seats[rowIndex][seatIndex].id;
    setSelected(id);
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Koltuk Seçimi</h1>

      {/* Screen */}
      <div className="bg-white w-3/5 h-8 rounded-b-xl shadow mb-10 text-center text-black font-semibold">
        <span className="text-sm">PERDE</span>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-2">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((seat, seatIndex) => {
              const isSelected = selected === seat.id;
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

      {/* Legend */}
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

      {/* Selected Info */}
      {selected && (
        <div className="mt-6 text-center">
          <p className="text-lg">Seçilen Koltuk: <strong>{selected}</strong></p>
          <button
            className="mt-4 bg-[#a020f0] px-6 py-2 rounded-full font-semibold text-white hover:bg-purple-700 transition"
            onClick={() => alert(`Koltuk seçildi: ${selected}`)}
          >
            Devam Et
          </button>
        </div>
      )}
    </div>
  );
}
