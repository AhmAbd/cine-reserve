'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MovieCard from '../../../components/MovieCard';

export default function CinemaDetailPage({ params }) {
  const [cinema, setCinema] = useState(null);
  const [showings, setShowings] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [sortedDates, setSortedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cinemaId = params.slug;

        // Fetch cinema data
        const cinemaRef = doc(db, 'cinemas', cinemaId);
        const cinemaSnap = await getDoc(cinemaRef);

        if (!cinemaSnap.exists()) {
          throw new Error('Sinema bulunamadı');
        }

        setCinema(cinemaSnap.data());

        // Fetch showings
        const filmsSnap = await getDocs(collection(db, 'films'));
        const now = new Date();
        const showingsList = [];

        filmsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          data.cinemas?.forEach((s) => {
            if (s.id === cinemaId && s.showtime) {
              const showtimeDate = s.showtime.toDate
                ? s.showtime.toDate()
                : new Date(s.showtime);
              if (showtimeDate >= now) {
                showingsList.push({
                  movieId: docSnap.id,
                  slug: data.slug,
                  title: data.title,
                  genre: data.genre,
                  duration: data.duration,
                  imgSrc: data.imgSrc,
                  showtime: showtimeDate,
                  hallNumber: s.hallNumber || 'Bilinmeyen Salon', // Fetch hallNumber with fallback
                });
              }
            }
          });
        });

        // Group by date
        const groupedByDate = {};
        showingsList.forEach((item) => {
          const dateKey = item.showtime.toISOString().split('T')[0];
          if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
          groupedByDate[dateKey].push(item);
        });

        // Sort dates
        const sortedDateKeys = Object.keys(groupedByDate).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        setShowings(showingsList);
        setGrouped(groupedByDate);
        setSortedDates(sortedDateKeys);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cinema data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                animate={{
                  y: [0, -10, 0],
                  transition: {
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                  },
                }}
              />
            ))}
          </div>
          <motion.p
            className="text-white text-xl font-medium"
            animate={{
              opacity: [0.6, 1, 0.6],
              transition: {
                repeat: Infinity,
                duration: 2,
              },
            }}
          >
            Sinema bilgileri yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Hata oluştu</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/cinemas"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Tüm Sinemalar
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Sinema bulunamadı
          </h2>
          <Link
            href="/cinemas"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Tüm Sinemalar
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] text-white px-4 sm:px-6 py-12">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 filter blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-indigo-600 filter blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Back button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/cinemas"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-300 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Tüm Sinemalar
          </Link>
        </motion.div>

        {/* Cinema Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 font-cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {cinema.name}
          </motion.h1>
          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full mx-auto mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          <motion.p
            className="text-lg text-gray-300 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {cinema.location}
          </motion.p>
          {cinema.mapLink && (
            <motion.a
              href={cinema.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 underline mt-1 inline-block transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Google Maps'te Aç
            </motion.a>
          )}
        </motion.div>

        {/* Showings by Date */}
        <motion.div
          className="max-w-5xl mx-auto space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2
                  className="text-2xl font-semibold mb-6 pb-2 border-b-2 border-purple-600 inline-block"
                  whileHover={{ scale: 1.02 }}
                >
                  {new Date(date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[date].map((movie, index) => (
                    <motion.div
                      key={`${movie.slug}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all h-full">
                        <MovieCard movie={movie} />
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-purple-400 font-medium">
                            {movie.showtime.toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            <span className="text-gray-300">({movie.hallNumber})</span>
                          </p>
                          <Link
                            href={`/tickets/select-type?movie=${movie.movieId}&cinema=${params.slug}&hall=${movie.hallNumber}`}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
                          >
                            Bilet Al
                          </Link>

                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                Gösterim bulunamadı
              </h3>
              <p className="text-gray-500">
                Bu sinemada şu anda gösterim planı bulunmuyor
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');

        .font-cinematic {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>
    </div>
  );
}