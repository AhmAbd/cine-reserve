'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        const token = await user.getIdTokenResult();
        if (!token.claims.admin) {
          router.push('/admin/login');
        } else {
          fetchCinemas();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCinemas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cinemas'));
      const cinemasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCinemas(cinemasList);
    } catch (error) {
      console.error('Error fetching cinemas: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bu sinema salonunu silmek istediğinize emin misiniz?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'cinemas', id));
      setCinemas((prev) => prev.filter((cinema) => cinema.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi başarısız oldu.');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/cinemas/edit/${id}`);
  };

  const filteredCinemas = cinemas.filter((cinema) =>
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h2 className="text-3xl font-bold mb-6 text-center">🎬 Sinema Salonları</h2>

      <input
        type="text"
        placeholder="Sinema salonu ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredCinemas.length > 0 ? (
        <div className="overflow-x-auto">
          <motion.table
            className="min-w-full bg-gray-800 rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <thead className="bg-gray-700 text-left text-gray-300">
              <tr>
                <th className="px-6 py-4">Sinema Adı</th>
                <th className="px-6 py-4">Konum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCinemas.map((cinema, index) => (
                <motion.tr
                  key={cinema.id}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-all`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 font-medium">{cinema.name}</td>
                  <td className="px-6 py-4">{cinema.location}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(cinema.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                    >
                      <FaEdit />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(cinema.id)}
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
        <p className="text-center text-gray-400">Hiç sinema salonu bulunamadı.</p>
      )}
    </motion.div>
  );
}
