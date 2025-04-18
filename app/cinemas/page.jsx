'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CinemaCard from '../../components/CinemaCard';
import Link from 'next/link';

export default function CinemaListPage() {
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    const fetchCinemas = async () => {
      const snapshot = await getDocs(collection(db, 'cinemas'));
      const cinemaList = [];
      snapshot.forEach((doc) => {
        cinemaList.push({ id: doc.id, ...doc.data() });
      });
      setCinemas(cinemaList);
    };

    fetchCinemas();
  }, []);

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Tüm Sinemalar</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      <div className="card-wrapper">
        {cinemas.map((cinema) => (
          <Link key={cinema.id} href={`/cinemas/${cinema.id}`}>
            <div className="cinema-card hover:scale-105 transition-transform">
              <CinemaCard cinema={cinema} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
