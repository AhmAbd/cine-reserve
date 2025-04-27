'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';

export default function CinemaSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieId = searchParams.get('movie');

  const [cinemaOptions, setCinemaOptions] = useState([]);
  const [movieTitle, setMovieTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      if (!movieId) {
        setError('Film ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        const filmRef = doc(db, 'films', movieId);
        const filmSnap = await getDoc(filmRef);

        if (!filmSnap.exists()) {
          setError('Film bulunamadı');
          setLoading(false);
          return;
        }

        const film = filmSnap.data();
        setMovieTitle(film.title || 'Film');

        const cinemaData = await Promise.all(
          (film.cinemas || []).map(async (cinemaItem) => {
            const cinemaSnap = await getDoc(doc(db, 'cinemas', cinemaItem.id));
            if (!cinemaSnap.exists()) return null;

            const hallDisplay = cinemaItem.hallNumber
              ? `${cinemaItem.hallNumber}`
              : null;

            return {
              uniqueKey: `${cinemaItem.id}-${cinemaItem.hallNumber || 'no-hall'}-${cinemaItem.showtime}`,
              id: cinemaItem.id,
              showtime: cinemaItem.showtime,
              hallDisplay,
              hallId: cinemaItem.hallNumber,
              ...cinemaSnap.data(),
            };
          })
        );

        setCinemaOptions(cinemaData.filter(Boolean));
        setLoading(false);
      } catch (err) {
        console.error('Hata:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [movieId]);

  const handleSelect = (cinemaId, hallId) => {
    router.push(`/tickets/select-type?movie=${movieId}&cinema=${cinemaId}${hallId ? `&hall=${hallId}` : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg flex items-center justify-center"
            animate={{ rotateY: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              className="w-12 h-12 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 2h6v2H9V2zm0 4h6v2H9V6zm0 4h6v2H9v-2zm0 4h6v2H9v-2zm0 4h6v2H9v-2zM5 2H3v20h2V2zm16 0h-2v20h2V2zm-6 0h-2v20h2V2z" />
            </svg>
          </motion.div>
          <motion.p
            className="text-white text-xl font-medium font-cinematic"
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
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
          className="text-center bg-gray-800/20 backdrop-blur-lg p-8 rounded-xl border border-gray-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 font-cinematic">Hata oluştu</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/cinemas"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
          >
            Tüm Sinemalar
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden">
      {/* 3D Parallax Background */}
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
        {/* Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 bg-gray-900/70 backdrop-blur-md hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/40 border border-purple-500/20"
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
            Tüm Filmler
          </Link>
        </motion.div>

        {/* Header with Enhanced Tilt */}
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} glareEnable={true} glareMaxOpacity={0.5} glareColor="#a020f0">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-10 rounded-2xl border border-purple-500/30 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 font-cinematic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sinema Seçimi
            </motion.h1>
            <motion.div
              className="w-40 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-xl text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-purple-300 font-bold">{movieTitle}</span> filmi için bir sinema salonu seçin
            </motion.p>
          </motion.div>
        </Tilt>

        {/* Cinema Options */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {cinemaOptions.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
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
              <h3 className="text-xl font-medium text-gray-100 mb-2 font-cinematic">
                Sinema bulunamadı
              </h3>
              <p className="text-gray-300">
                Bu film için şu anda gösterim yapan sinema bulunmuyor
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cinemaOptions.map((cinema, index) => (
                <motion.button
                  key={cinema.uniqueKey}
                  onClick={() => handleSelect(cinema.id, cinema.hallId)}
                  className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/40 overflow-hidden card-3d"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Neon Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0"
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div className="relative z-10">
                    <div className="font-semibold text-2xl text-white font-cinematic">
                      {cinema.name}
                    </div>
                    <div className="text-sm text-gray-200 mt-3">
                      Seans:{' '}
                      {new Date(cinema.showtime).toLocaleString('tr-TR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-sm text-gray-200 mt-2">
                      Yer: {cinema.location}
                    </div>
                    {cinema.hallDisplay && (
                      <div className="text-sm text-gray-200 mt-2">
                        Salon: {cinema.hallDisplay}
                      </div>
                    )}
                    {cinema.mapLink && (
                      <a
                        href={cinema.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-300 hover:text-purple-100 underline mt-3 inline-block transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Haritada Göster
                      </a>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');

        .font-cinematic {
          font-family: 'Montserrat', sans-serif;
        }

        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0d0d1a;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a020f0, #4f46e5);
          border-radius: 4px;
        }

        /* 3D Card Effect */
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .card-3d:hover {
          transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
        }

        /* Optional mouse movement effect */
        .card-3d {
          position: relative;
        }

        .card-3d::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .card-3d:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}