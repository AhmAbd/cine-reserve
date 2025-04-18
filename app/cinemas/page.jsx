'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CinemaCard from '../../components/CinemaCard';
import Link from 'next/link';

export default function CinemaListPage() {
  const [cinemas, setCinemas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      const snapshot = await getDocs(collection(db, 'cinemas'));
      const cinemaList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCinemas(cinemaList);
      setFiltered(cinemaList);
    };

    fetchCinemas();
  }, []);

  useEffect(() => {
    const results = cinemas.filter((cinema) =>
      cinema.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, cinemas]);

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Tüm Sinemalar</h1>
        <div className="w-24 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Sinema ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#a020f0] transition"
        />
      </div>

      <div className="card-wrapper grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filtered.map((cinema) => (
          <Link key={cinema.id} href={`/cinemas/${cinema.id}`}>
            <div className="cinema-card hover:scale-105 transition-transform">
              <CinemaCard cinema={cinema} />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Sinema bulunamadı.</p>
      )}
    </div>
  );
}
