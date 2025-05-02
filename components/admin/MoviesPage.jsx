'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddFilm from './AddFilm';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        fetchMovies();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchMovies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'films'));
      const moviesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(moviesList);
    } catch (error) {
      console.error('Error fetching movies: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bu filmi silmek istediğinize emin misiniz?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'films', id));
      setMovies((prev) => prev.filter((movie) => movie.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi başarısız oldu.');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/movies/edit/${id}`);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOutsideClick = (e) => {
    if (e.target.className.includes('fixed inset-0')) {
      setShowAddModal(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center">
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/30 to-pink-900/30 blur-sm" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-10 px-4"> {/* Changed from fixed to min-h-screen and added padding top */}
      <motion.div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950 to-black pointer-events-none z-0" />
      <motion.div 
        className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto text-white border border-purple-500/20 flex flex-col overflow-auto" 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🎬 Film Yönetimi
          </h2>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Film Ekle
          </motion.button>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <motion.input
            type="text"
            placeholder="Film ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Movie Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredMovies.length > 0 ? (
            <table className="min-w-full bg-gray-800/30 rounded-lg overflow-hidden">
              <thead className="bg-gray-700 text-left text-gray-300 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Başlık</th>
                  <th className="px-6 py-4">Tür</th>
                  <th className="px-6 py-4">Süre</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie, index) => (
                  <tr
                    key={movie.id}
                    className="border-b border-gray-700 hover:bg-gray-700/20"
                  >
                    <td className="px-6 py-4 font-medium">{movie.title}</td>
                    <td className="px-6 py-4">{movie.genre}</td>
                    <td className="px-6 py-4">{movie.duration}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <motion.button
                        onClick={() => handleEdit(movie.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/90 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEdit /> Düzenle
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(movie.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash /> Sil
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center py-8">Sonuç bulunamadı</p>
          )}
        </div>
      </motion.div>

      {/* Modal for AddFilm */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOutsideClick}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl p-6"
            >
              <motion.button
                onClick={() => setShowAddModal(false)}
                className="absolute top-2 right-2 text-white text-xl z-50 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
              <AddFilm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}