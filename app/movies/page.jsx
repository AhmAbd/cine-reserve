'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "films"));
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMovies(list);
        setFiltered(list);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, movies]);

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
                    delay: i * 0.2
                  }
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
                duration: 2
              }
            }}
          >
            Filmler yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] text-white px-4 sm:px-6 py-12">
      {/* Background elements matching other pages */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 filter blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-indigo-600 filter blur-3xl" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 font-cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Tüm Filmler
          </motion.h1>
          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>

        {/* Search Bar */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            placeholder="Film ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder-gray-500"
          />
        </motion.div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filtered.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <Link href={`/movies/${movie.slug}`}>
                  <motion.div 
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-purple-500/30 transition-all h-full flex flex-col"
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.3)" }}
                  >
                    <div className="relative">
                      <motion.img
                        src={movie.imgSrc}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {movie.rating && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                          {movie.rating}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-grow">
                      <h2 className="text-xl font-semibold mb-1">{movie.title}</h2>
                      <p className="text-sm text-gray-400 mb-3">{movie.genre} • {movie.duration}</p>
                      <motion.div
                        className="w-full h-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <div className="px-5 pb-5">
                      <motion.button
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-medium transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Detayları Gör
                      </motion.button>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Film bulunamadı</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {search ? `"${search}" için sonuç bulunamadı` : 'Şu anda gösterimde olan film bulunmuyor'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
              >
                Filtreyi Temizle
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        
        .font-cinematic {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>
    </div>
  );
}