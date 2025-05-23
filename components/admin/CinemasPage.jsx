'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import AddCinema from './AddCinema';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openCinemaId, setOpenCinemaId] = useState(null);
  const [showAddCinema, setShowAddCinema] = useState(false);
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
  }, [router]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const cinemasQuery = collection(db, 'cinemas');
      const cinemasSnapshot = await getDocs(cinemasQuery);
      const cinemasData = cinemasSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        location: doc.data().location,
        seats: doc.data().seats,
        halls: Array.isArray(doc.data().halls) ? doc.data().halls.sort() : ['Bilinmeyen Salon']
      }));
      setCinemas(cinemasData);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bu sinema salonunu silmek istediğinize emin misiniz?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'cinemas', id));
      setCinemas(prev => prev.filter(cinema => cinema.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Sinema silme işlemi başarısız oldu.');
    }
  };

  const handleDeleteHall = async (cinemaId, hallNumber) => {
    const confirm = window.confirm(`"${hallNumber}" salonunu silmek istediğinize emin misiniz?`);
    if (!confirm) return;

    try {
      const cinemaRef = doc(db, 'cinemas', cinemaId);
      const cinema = cinemas.find(c => c.id === cinemaId);
      const updatedHalls = cinema.halls.filter(h => h !== hallNumber);
      await updateDoc(cinemaRef, {
        halls: updatedHalls.length > 0 ? updatedHalls : ['Bilinmeyen Salon']
      });
      setCinemas(prev =>
        prev.map(cinema => {
          if (cinema.id === cinemaId) {
            return {
              ...cinema,
              halls: updatedHalls.length > 0 ? updatedHalls : ['Bilinmeyen Salon']
            };
          }
          return cinema;
        })
      );
      if (updatedHalls.length === 0 && hallNumber !== 'Bilinmeyen Salon') {
        setOpenCinemaId(null);
      }
    } catch (error) {
      console.error('Salon silme hatası:', error);
      alert('Salon silme işlemi başarısız oldu.');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/cinemas/edit/${id}`);
  };

  const toggleDropdown = (id) => {
    setOpenCinemaId(openCinemaId === id ? null : id);
  };

  const filteredCinemas = cinemas.filter(cinema =>
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOutsideClick = (e) => {
    if (e.target.className.includes('fixed inset-0')) {
      setShowAddCinema(false);
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
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-black via-purple-950 to-black z-0"
        initial={{
          background: 'linear-gradient(180deg, #000000 0%, #000000 50%, #000000 100%)',
        }}
        animate={{
          background: 'linear-gradient(180deg, #000000 0%, #2d1a4b 50%, #000000 100%)',
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full pointer-events-none blur-sm"
          style={{ backgroundColor: 'rgba(147, 51, 234, 0.5)' }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0.5,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto text-white border border-purple-500/20 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🎬 Sinema Salonu Yönetimi
          </h2>
          <motion.button
            onClick={() => setShowAddCinema(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Ekle
          </motion.button>
        </div>

        <div className="mb-6 relative">
          <motion.input
            type="text"
            placeholder="Sinema salonu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          {filteredCinemas.length > 0 ? (
            <motion.table className="w-full bg-gray-800/30 rounded-lg overflow-hidden">
              <thead className="bg-gray-700 text-left text-gray-300 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Sinema Adı</th>
                  <th className="px-6 py-4">Konum</th>
                  <th className="px-6 py-4">Koltuk Sayısı</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCinemas.map((cinema) => (
                    <React.Fragment key={cinema.id}>
                      <motion.tr
                        className="border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleDropdown(cinema.id)}
                      >
                        <td className="px-6 py-4 font-medium flex items-center justify-between">
                          {cinema.name}
                          <motion.span
                            animate={{ rotate: openCinemaId === cinema.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {openCinemaId === cinema.id ? <FaChevronUp /> : <FaChevronDown />}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={cinema.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-300 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Konumu Gör
                          </a>
                        </td>
                        <td className="px-6 py-4">{cinema.seats || 'Bilinmiyor'}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(cinema.id);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/90 text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEdit /> Düzenle
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cinema.id);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTrash /> Sil
                          </motion.button>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {openCinemaId === cinema.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-900/50"
                          >
                            <td colSpan="4" className="px-6 py-4">
                              <div className="mb-2 text-sm text-gray-400">Salonlar:</div>
                              <div className="flex flex-wrap gap-2">
                                {cinema.halls.map((hall) => (
                                  <motion.div
                                    key={`${cinema.id}-${hall}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative bg-purple-900/30 text-purple-300 px-3 py-2 rounded-lg flex items-center gap-2"
                                  >
                                    {hall}
                                    {hall !== 'Bilinmeyen Salon' && (
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteHall(cinema.id, hall);
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <FaTrash size={12} />
                                      </motion.button>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </motion.table>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block p-6 bg-gray-800/50 rounded-xl"
              >
                <p className="text-gray-400">Sonuç bulunamadı</p>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 text-sm bg-purple-900/50 text-purple-300 rounded-lg"
                    whileHover={{ backgroundColor: 'rgba(107, 33, 168, 0.7)' }}
                  >
                    Filtreyi Temizle
                  </motion.button>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showAddCinema && (
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
                onClick={() => setShowAddCinema(false)}
                className="absolute top-2 right-2 text-white text-xl z-50 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
              <AddCinema />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}