'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function EditFilmPage({ id }) {
  const router = useRouter();

  // Film bilgileri
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    releaseDate: '',
    summary: '',
    imgSrc: '',
    rating: '',
    slug: '',
    trailerUrl: '',
    language: '',
    director: '',
    cast: ''
  });

  // Sinema ve seans bilgileri
  const [cinemas, setCinemas] = useState([]);
  const [cinemaOptions, setCinemaOptions] = useState([]);
  const [cinemaHalls, setCinemaHalls] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        const token = await user.getIdTokenResult();
        if (!token.claims.admin) {
          router.push('/admin/login');
        } else {
          await fetchFilm();
          await fetchCinemas();
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchFilm = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, 'films', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || '',
          genre: data.genre || '',
          duration: data.duration || '',
          releaseDate: data.releaseDate?.toDate().toISOString().split('T')[0] || '',
          summary: data.description || '',
          imgSrc: data.imgSrc || '',
          rating: data.rating || '',
          slug: data.slug || '',
          trailerUrl: data.trailerUrl || '',
          language: data.language || '',
          director: data.director || '',
          cast: data.cast?.join(', ') || ''
        });
        setCinemas(data.cinemas || []);
      } else {
        setError('Film bulunamadı.');
        router.push('/admin/movies');
      }
    } catch (error) {
      console.error('Film verisi alınırken hata:', error);
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      const cinemasCollection = collection(db, 'cinemas');
      const querySnapshot = await getDocs(cinemasCollection);
      const cinemaList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        halls: doc.data().halls || []
      }));
      
      setCinemaOptions(cinemaList);
      
      const hallsMap = {};
      cinemaList.forEach(cinema => {
        hallsMap[cinema.id] = cinema.halls;
      });
      setCinemaHalls(hallsMap);
    } catch (error) {
      console.error('Sinema verisi alınırken hata:', error);
      setError('Sinema bilgileri alınamadı.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    router.push('/admin/movies');
  };

  const handleUpdate = async () => {
    try {
      if (!formData.title || !formData.genre || !formData.releaseDate) {
        setError('Lütfen zorunlu alanları doldurun (Başlık, Tür, Vizyon Tarihi)');
        return;
      }

      if (cinemas.length === 0) {
        setError('En az bir sinema ve seans eklemelisiniz');
        return;
      }

      const hasInvalidShowtimes = cinemas.some(cinema => 
        !cinema.id || !cinema.showtime || !cinema.hallNumber
      );
      
      if (hasInvalidShowtimes) {
        setError('Tüm seanslar için sinema, salon ve gösterim saati seçmelisiniz');
        return;
      }

      await updateDoc(doc(db, 'films', id), {
        title: formData.title,
        genre: formData.genre,
        duration: formData.duration,
        releaseDate: Timestamp.fromDate(new Date(formData.releaseDate)),
        description: formData.summary,
        imgSrc: formData.imgSrc,
        rating: formData.rating,
        slug: formData.slug,
        trailerUrl: formData.trailerUrl,
        language: formData.language,
        director: formData.director,
        cast: formData.cast.split(',').map(item => item.trim()).filter(item => item),
        cinemas: cinemas.map(cinema => ({
          ...cinema,
          showtime: cinema.showtime
        })),
        updatedAt: Timestamp.now()
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/movies');
      }, 2000);
    } catch (error) {
      console.error('Film güncelleme hatası:', error);
      setError('Güncelleme sırasında hata oluştu: ' + error.message);
    }
  };

  const handleCinemaChange = (index, field, value) => {
    const newCinemas = [...cinemas];
    newCinemas[index] = {
      ...newCinemas[index],
      [field]: value
    };
    
    if (field === 'id') {
      newCinemas[index].hallNumber = '';
    }
    
    setCinemas(newCinemas);
  };

  const addCinema = () => {
    setCinemas([...cinemas, { id: '', hallNumber: '', showtime: '' }]);
  };

  const removeCinema = (index) => {
    setCinemas(cinemas.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80">
        <div className="text-white text-2xl animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">🎬 Film Düzenle</h2>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Film Bilgileri</h3>
            
            {[
              { label: 'Film Başlığı*', name: 'title', value: formData.title },
              { label: 'Tür*', name: 'genre', value: formData.genre },
              { label: 'Süre (dk)', name: 'duration', value: formData.duration, type: 'number' },
              { label: 'Dil', name: 'language', value: formData.language },
              { label: 'Yönetmen', name: 'director', value: formData.director },
              { label: 'Oyuncular (virgülle ayırın)', name: 'cast', value: formData.cast },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                <input
                  name={field.name}
                  value={field.value}
                  onChange={handleInputChange}
                  type={field.type || 'text'}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Vizyon Tarihi*</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Medya Bilgileri</h3>
            
            {[
              { label: 'Poster URL*', name: 'imgSrc', value: formData.imgSrc, type: 'url' },
              { label: 'Fragman URL', name: 'trailerUrl', value: formData.trailerUrl, type: 'url' },
              { label: 'Değerlendirme (IMDB vb.)', name: 'rating', value: formData.rating },
              { label: 'Slug (URL için)', name: 'slug', value: formData.slug },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                <input
                  name={field.name}
                  value={field.value}
                  onChange={handleInputChange}
                  type={field.type || 'text'}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Özet</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">🎥 Sinema ve Seanslar</h3>
            <button
              onClick={addCinema}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              <span>+</span> Seans Ekle
            </button>
          </div>

          {cinemas.length === 0 ? (
            <div className="text-center py-6 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">Henüz seans eklenmedi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cinemas.map((cinema, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 p-4 rounded-xl border border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Sinema*</label>
                      <select
                        value={cinema.id}
                        onChange={(e) => handleCinemaChange(index, 'id', e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="">Sinema seçin...</option>
                        {cinemaOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Salon*</label>
                      <select
                        value={cinema.hallNumber}
                        onChange={(e) => handleCinemaChange(index, 'hallNumber', e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
                        disabled={!cinema.id}
                      >
                        <option value="">Salon seçin...</option>
                        {cinema.id && cinemaHalls[cinema.id]?.map((hall, i) => (
                          <option key={i} value={hall}>
                            {hall}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Seans Saati*</label>
                      <input
                        type="datetime-local"
                        value={cinema.showtime}
                        onChange={(e) => handleCinemaChange(index, 'showtime', e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCinema(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Seansı Kaldır
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
          >
            İptal
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Güncelle
          </button>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-xl shadow-2xl text-center max-w-md">
              <p className="text-2xl font-bold mb-2">✔️ Başarılı!</p>
              <p>Film başarıyla güncellendi. Yönlendiriliyorsunuz...</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}