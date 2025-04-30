'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth';
import MovieCard from '../../components/MovieCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchFavorites = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const slugs = userSnap.data()?.favorites || [];

        if (slugs.length === 0) {
          setFavoriteMovies([]);
          return;
        }

        const filmsSnapshot = await getDocs(collection(db, 'films'));
        const allMovies = filmsSnapshot.docs.map(doc => doc.data());

        // Match slugs
        const favorites = allMovies.filter(movie => slugs.includes(movie.slug));
        setFavoriteMovies(favorites);
      } catch (error) {
        console.error('Favoriler alınırken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* Parallax Background */}
      <div className="fixed inset-0 z-[-2]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] opacity-80"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-indigo-900/30 opacity-50"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Tilt */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareColor="#9333ea">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/40 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              🎬 Favorilerim
            </motion.h2>
            <motion.div
              className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-lg text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              En sevdiğiniz filmleri burada görüntüleyin
            </motion.p>
          </motion.div>
        </Tilt>

        <AnimatePresence>
          {authLoading ? (
            <motion.div
              className="flex justify-center items-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="animate-spin h-10 w-10 text-purple-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <p className="text-gray-200 text-lg">Yükleniyor...</p>
              </div>
            </motion.div>
          ) : !user ? (
            <motion.div
              className="text-center py-12 bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl border border-purple-500/30 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.7-3 5m3-5H8m4 5v3m-7-8h14m-9-6v2m4-2v2"
                />
              </svg>
              <p className="text-gray-200 text-lg">Giriş yapmanız gerekiyor.</p>
              <p className="text-gray-400 text-sm mt-2">
                Favorilerinizi görmek için lütfen hesabınıza giriş yapın.
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div
              className="flex justify-center items-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="animate-spin h-10 w-10 text-purple-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <p className="text-gray-200 text-lg">Favoriler yükleniyor...</p>
              </div>
            </motion.div>
          ) : favoriteMovies.length === 0 ? (
            <motion.div
              className="text-center py-12 bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl border border-purple-500/30 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-gray-200 text-lg">Henüz favorilere eklediğiniz bir film yok.</p>
              <p className="text-gray-400 text-sm mt-2">
                Beğendiğiniz filmleri favorilere ekleyerek burada görebilirsiniz!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteMovies.map((movie, index) => (
                <motion.div
                  key={movie.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/movies/${movie.slug}`}>
                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.2} glareColor="#9333ea">
                      <div className="hover:scale-105 transition-transform duration-300">
                        <MovieCard movie={movie} />
                      </div>
                    </Tilt>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoritesPage;