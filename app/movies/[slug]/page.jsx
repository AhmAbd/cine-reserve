'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import Link from 'next/link';
import useRequireAuth from '../../../hooks/useRequireAuth';

export default function MovieDetailPage({ params }) {
  const slug = params.slug;
  const { user, loading: authLoading } = useRequireAuth();
  const [movie, setMovie] = useState(null);
  const [cinemaData, setCinemaData] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch movie & cinemas
  useEffect(() => {
    const fetchMovie = async () => {
      const filmSnap = await getDocs(collection(db, 'films'));
      let foundMovie = null;

      filmSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.slug === slug) foundMovie = data;
      });

      if (!foundMovie) {
        setLoading(false);
        return;
      }

      setMovie(foundMovie);

      const cinemas = await Promise.all(
        (foundMovie.cinemas || []).map(async (cinema) => {
          const snap = await getDoc(doc(db, 'cinemas', cinema.id));
          return {
            ...cinema,
            name: snap.exists() ? snap.data().name : cinema.id,
          };
        })
      );

      setCinemaData(cinemas);
      setLoading(false);
    };

    fetchMovie();
  }, [slug]);

  // ✅ Check if movie is in favorites
  useEffect(() => {
    const checkFavorites = async () => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const favorites = userSnap.data()?.favorites || [];
      setIsFavorite(favorites.includes(slug));
    };

    if (user && movie) checkFavorites();
  }, [user, movie]);

  // ✅ Handle add/remove
  const toggleFavorite = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      favorites: isFavorite ? arrayRemove(slug) : arrayUnion(slug),
    });

    setIsFavorite(!isFavorite);
  };

  // ✅ Group showtimes
  const sessionsByDate = {};
  cinemaData.forEach((cinema) => {
    const dateKey = new Date(cinema.showtime).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      weekday: 'short',
    });

    if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
    sessionsByDate[dateKey].push(cinema);
  });

  const sortedDates = Object.keys(sessionsByDate).sort(
    (a, b) =>
      new Date(sessionsByDate[a][0].showtime) -
      new Date(sessionsByDate[b][0].showtime)
  );

  if (loading) {
    return <div className="text-white p-10">Yükleniyor...</div>;
  }

  if (!movie) {
    return <div className="text-white p-10">Film bulunamadı.</div>;
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3">
          <img
            src={movie.imgSrc}
            alt={movie.title}
            className="w-full h-[550px] object-cover rounded-xl shadow-lg"
          />
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              className="block mt-4 text-center bg-[#a020f0] text-white py-2 rounded-md font-medium hover:bg-purple-700 transition"
              rel="noopener noreferrer"
            >
              🎬 Fragmanı İzle
            </a>
          )}
        </div>

        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            <Link
              href="/movies"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              ← Tüm Filmler
            </Link>
          </div>
          <div className="w-16 h-1 bg-[#a020f0] rounded-full mb-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-300">
            <div>
              <span className="block text-gray-500 text-xs mb-1">Tür</span>
              <p>{movie.genre}</p>
            </div>
            <div>
              <span className="block text-gray-500 text-xs mb-1">Süre</span>
              <p>{movie.duration}</p>
            </div>
            <div>
              <span className="block text-gray-500 text-xs mb-1">
                Vizyon Tarihi
              </span>
              <p>
                {new Date(movie.releaseDate.toDate()).toLocaleDateString(
                  'tr-TR'
                )}
              </p>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed">{movie.description}</p>

          {/* ✅ Favorite toggle button */}
          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-md w-fit transition ${
              isFavorite
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isFavorite ? '💔 Favorilerden Kaldır' : '❤️ Favorilere Ekle'}
          </button>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">
              Bu Filmi İzleyebileceğiniz Salonlar
            </h2>
            <div className="w-16 h-1 bg-[#a020f0] rounded-full mb-6" />

            {sortedDates.length > 0 ? (
              <div className="space-y-8">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {sortedDates.map((date) => (
                    <div key={date} className="min-w-[220px]">
                      <div className="text-white font-semibold text-sm mb-3">
                        {date}
                      </div>
                      {sessionsByDate[date].map((cinema) => (
                        <div
                          key={cinema.id + cinema.showtime}
                          className="bg-gray-800 p-4 rounded-md mb-3"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{cinema.name}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(
                                  cinema.showtime
                                ).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <Link
                              href={`/tickets/select-seat?movie=${slug}&cinema=${cinema.id}`}
                              className="bg-[#a020f0] px-4 py-2 rounded-md text-white hover:bg-purple-700 transition whitespace-nowrap"
                            >
                              Bilet Al
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Bu film için uygun sinema bulunamadı.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
