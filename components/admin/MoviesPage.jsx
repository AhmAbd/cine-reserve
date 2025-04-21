'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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
  }, []);

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

  if (loading) {
    return <div className="text-white text-center mt-20 animate-pulse">Yükleniyor...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 max-w-6xl mx-auto mt-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-center">🎬 Filmler</h2>

      <input
        type="text"
        placeholder="Film ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredMovies.length > 0 ? (
        <div className="overflow-x-auto">
          <motion.table
            className="min-w-full bg-gray-800 rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <thead className="bg-gray-700 text-left text-gray-300">
              <tr>
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Süre</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie, index) => (
                <motion.tr
                  key={movie.id}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-all`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 font-medium">{movie.title}</td>
                  <td className="px-6 py-4">{movie.genre}</td>
                  <td className="px-6 py-4">{movie.duration} dk</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(movie.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <FaEdit />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                    >
                      <FaTrash />
                      Sil
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      ) : (
        <p className="text-center text-gray-400">Hiç film bulunamadı.</p>
      )}
    </motion.div>
  );
}
