'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function CinemaSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieId = searchParams.get('movie'); // this is Firestore doc ID

  const [cinemaOptions, setCinemaOptions] = useState([]);
  const [movieTitle, setMovieTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      if (!movieId) {
        console.warn('No movie ID found in URL');
        return;
      }

      try {
        const filmRef = doc(db, 'films', movieId);
        const filmSnap = await getDoc(filmRef);

        if (!filmSnap.exists()) {
          console.warn('Film not found:', movieId);
          return;
        }

        const film = filmSnap.data();
        setMovieTitle(film.title || 'Film');

        const cinemaData = await Promise.all(
          (film.cinemas || []).map(async ({ id, showtime }) => {
            const cinemaSnap = await getDoc(doc(db, 'cinemas', id));
            if (!cinemaSnap.exists()) return null;

            return {
              id,
              showtime,
              ...cinemaSnap.data()
            };
          })
        );

        setCinemaOptions(cinemaData.filter(Boolean));
      } catch (err) {
        console.error('CinemaSelector fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [movieId]);

  const handleSelect = (cinemaId) => {
    router.push(`/tickets/select-type?movie=${movieId}&cinema=${cinemaId}`);
  };

  if (loading) return <div className="text-white p-10">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Sinema Seç</h1>
      <p className="mb-6">
        Lütfen <span className="text-[#a020f0] font-bold">{movieTitle}</span> filmi için bir sinema salonu seçin:
      </p>

      {cinemaOptions.length === 0 ? (
        <p className="text-gray-400">Bu film için uygun sinema bulunamadı.</p>
      ) : (
        <div className="space-y-4">
          {cinemaOptions.map((cinema) => (
            <button
              key={cinema.id}
              onClick={() => handleSelect(cinema.id)}
              className="block w-full bg-[#2d3748] hover:bg-[#a020f0] text-white text-left px-4 py-3 rounded-md transition"
            >
              <div className="font-semibold text-lg">{cinema.name}</div>
              <div className="text-sm text-gray-400">
                Seans: {new Date(cinema.showtime).toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-400">Yer: {cinema.location}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
