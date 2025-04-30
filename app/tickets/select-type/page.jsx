'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import useRequireAuth from '../../../hooks/useRequireAuth';
import { Minus, Plus } from 'lucide-react';

export default function SelectTicketType() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');

  const { user } = useRequireAuth();
  const [counts, setCounts] = useState({ full: 1, student: 0 });
  const [prices, setPrices] = useState({ full: 0, student: 0 });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const priceDocRef = doc(db, 'prices', 'ticketTypes');
        const priceDoc = await getDoc(priceDocRef);
        if (priceDoc.exists()) {
          setPrices(priceDoc.data());
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };
    fetchPrices();
  }, []);

  const total = counts.full * prices.full + counts.student * prices.student;

  const handleCount = (type, delta) => {
    setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const handleContinue = () => {
    router.push(
      `/tickets/select-seat?movie=${movieId}&cinema=${cinemaId}&full=${counts.full}&student=${counts.student}`
    );
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white p-6 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-[#2b2b2b] rounded-xl shadow-md p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Bilet Seçimi</h2>
            <p className="text-sm text-gray-400 mt-1">
              Film ve seansı seçtin, şimdi bilet tipini seçmen gerekiyor. Öğrenci bileti için kimlik gerekebilir.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Toplam Fiyat</p>
            <p className="text-2xl font-bold text-purple-400">{total} TL</p>
            <button
              onClick={handleContinue}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
            >
              Devam Et
            </button>
          </div>
        </div>

        {[{ key: 'full', label: 'TAM', price: prices.full }, { key: 'student', label: 'ÖĞRENCİ', price: prices.student }].map(
          (type) => (
            <div
              key={type.key}
              className="flex items-center justify-between bg-white text-black rounded-lg px-4 py-3 shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 text-white p-2 rounded-full">
                  🎟️
                </div>
                <div>
                  <p className="text-lg font-semibold">{type.label}</p>
                  <p className="text-sm text-gray-500">{type.price} TL</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCount(type.key, -1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black rounded flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-semibold">{counts[type.key]}</span>
                <button
                  onClick={() => handleCount(type.key, 1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black rounded flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
