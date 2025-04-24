'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const { user, loading: authLoading } = useRequireAuth();
  const [movie, setMovie] = useState(null);
  const [cinemaData, setCinemaData] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(null);
  const [director, setDirector] = useState('');
  const [language, setLanguage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  // Fetch movie & cinemas
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(20);

        // 1. Fetch movie data
        const filmSnap = await getDocs(collection(db, 'films'));
        setLoadingProgress(40);

        let foundMovie = null;
        filmSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.slug === slug) {
            foundMovie = { id: docSnap.id, ...data };
            setDirector(data.director || 'Bilinmiyor');
            setLanguage(data.language || 'Türkçe');
          }
        });

        if (!foundMovie) {
          throw new Error('Film bulunamadı');
        }

        setMovie(foundMovie);
        setLoadingProgress(60);

        // 2. Fetch cinema and hall data
        if (!foundMovie.cinemas || foundMovie.cinemas.length === 0) {
          console.log('No cinema data found for this movie');
          setCinemaData([]);
          setLoadingProgress(100);
          setTimeout(() => setLoading(false), 500);
          return;
        }

        const cinemas = await Promise.all(
          foundMovie.cinemas.map(async (cinema) => {
            try {
              const [cinemaSnap, hallSnap] = await Promise.all([
                getDoc(doc(db, 'cinemas', cinema.id)),
                cinema.hallId ? getDoc(doc(db, 'halls', cinema.hallId)) : Promise.resolve(null)
              ]);

              return {
                ...cinema,
                id: cinema.id,
                name: cinemaSnap.exists() ? cinemaSnap.data().name : cinema.id,
                hallName: hallSnap?.exists() ? hallSnap.data().name : cinema.hallId || 'Salon 1',
                showtime: cinema.showtime
              };
            } catch (err) {
              console.error(`Error fetching cinema (${cinema.id}):`, err);
              return null;
            }
          })
        );

        // Filter out null values
        const validCinemas = cinemas.filter(cinema => cinema !== null);
        
        if (validCinemas.length === 0) {
          console.log('No valid cinema data found');
        }

        setCinemaData(validCinemas);
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error("Data fetch error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (slug) fetchMovie();
  }, [slug]);

  // Check if movie is in favorites
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

  // Handle add/remove favorite
  const toggleFavorite = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      favorites: isFavorite ? arrayRemove(slug) : arrayUnion(slug),
    });
    setIsFavorite(!isFavorite);
  };

  // Group showtimes by date with proper error handling
  const sessionsByDate = {};
  cinemaData.forEach((cinema) => {
    if (!cinema.showtime) {
      console.warn('Missing showtime for cinema:', cinema);
      return;
    }

    try {
      const showtimeDate = cinema.showtime.toDate 
        ? cinema.showtime.toDate() 
        : new Date(cinema.showtime);
      
      if (isNaN(showtimeDate.getTime())) {
        console.warn('Invalid date format:', cinema.showtime);
        return;
      }

      const dateKey = showtimeDate.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        weekday: 'short',
      });

      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(cinema);
    } catch (err) {
      console.error('Date processing error:', err);
    }
  });

  const sortedDates = Object.keys(sessionsByDate).sort(
    (a, b) => new Date(sessionsByDate[a][0].showtime) - new Date(sessionsByDate[b][0].showtime)
  );

  // Set first date as active by default
  useEffect(() => {
    if (sortedDates.length > 0 && !activeDate) {
      setActiveDate(sortedDates[0]);
    }
  }, [sortedDates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="relative w-64 h-2 bg-gray-700 rounded-full overflow-hidden"
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
          
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="flex gap-2"
              animate={{ 
                rotate: [0, 10, -10, 0],
                transition: { 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                } 
              }}
            >
              <div className="w-8 h-8 rounded-full bg-purple-500" />
              <div className="w-8 h-8 rounded-full bg-indigo-500" style={{ animationDelay: '0.2s' }} />
              <div className="w-8 h-8 rounded-full bg-pink-500" style={{ animationDelay: '0.4s' }} />
            </motion.div>
            
            <motion.p
              className="text-white text-xl font-medium"
              animate={{
                opacity: [0.6, 1, 0.6],
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
            >
              Film bilgileri yükleniyor...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Hata oluştu</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/movies"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Tüm Filmler
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Film bulunamadı</h2>
          <Link
            href="/movies"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Tüm Filmler
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 filter blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-600 filter blur-3xl mix-blend-overlay"></div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="flex flex-col lg:flex-row gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Movie Poster Section */}
          <motion.div
            className="w-full lg:w-1/3"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative group">
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={movie.imgSrc}
                  alt={movie.title}
                  className="w-full h-[550px] object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
              
              {movie.rating && (
                <motion.div
                  className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  {movie.rating}
                </motion.div>
              )}
            </div>

            {movie.trailerUrl && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Fragmanı İzle
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* Movie Details Section */}
          <motion.div
            className="w-full lg:w-2/3 flex flex-col gap-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <motion.h1
                className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {movie.title}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/movies"
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-300 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Tüm Filmler
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full mb-2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Tür', value: movie.genre, icon: '🎭' },
                { label: 'Süre', value: movie.duration, icon: '⏱️' },
                { 
                  label: 'Vizyon Tarihi', 
                  value: new Date(movie.releaseDate.toDate()).toLocaleDateString('tr-TR'),
                  icon: '📅'
                },
                { label: 'Yönetmen', value: director, icon: '🎬' },
                { label: 'Oyuncular', value: movie.cast?.join(', ') || 'Bilinmiyor', icon: '🌟' },
                { label: 'Dil', value: language, icon: '🗣️' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <span className="block text-gray-400 text-xs font-medium">{item.label}</span>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Konu</h3>
              <p className="text-gray-300 leading-relaxed">
                {movie.description}
              </p>
            </motion.div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isFavorite
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isFavorite ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Favorilerden Kaldır
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favorilere Ekle
                  </>
                )}
              </button>
            </motion.div>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                Seanslar
              </h2>
              
              <motion.div
                className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {sortedDates.length > 0 ? (
                <div className="space-y-8">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                    {sortedDates.map((date) => (
                      <motion.button
                        key={date}
                        onClick={() => setActiveDate(date)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-300 ${
                          activeDate === date
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {date}
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDate}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid gap-4"
                    >
                      {sessionsByDate[activeDate]?.map((cinema) => {
                        const showtime = cinema.showtime.toDate 
                          ? cinema.showtime.toDate() 
                          : new Date(cinema.showtime);
                        const timeString = showtime.toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        return (
                          <motion.div
                            key={cinema.id + cinema.showtime}
                            className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-all"
                            whileHover={{ y: -3 }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold">{cinema.name}</h3>
                                <p className="text-gray-400 mt-1">
                                  <span className="text-purple-400">{timeString}</span> • {cinema.hallNumber}
                                </p>
                              </div>
                              <Link
                                href={`/tickets/select-seat?movie=${slug}&cinema=${cinema.id}`}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                                </svg>
                                Bilet Al
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Uygun seans bulunamadı</h3>
                  <p className="text-gray-500">Bu film için şu anda gösterim planı bulunmuyor</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}