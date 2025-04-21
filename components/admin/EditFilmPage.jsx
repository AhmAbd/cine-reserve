'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function EditFilmPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [rating, setRating] = useState('');
  const [slug, setSlug] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [cinemaOptions, setCinemaOptions] = useState([]); // salonların isimlerini tutacak state
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        await fetchFilm();
        await fetchCinemas();  // Salonları al
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFilm = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, 'films', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || '');
        setGenre(data.genre || '');
        setDuration(data.duration || '');
        setReleaseDate(data.releaseDate?.toDate().toISOString().split('T')[0] || '');
        setSummary(data.description || '');
        setImgSrc(data.imgSrc || '');
        setRating(data.rating || '');
        setSlug(data.slug || '');
        setTrailerUrl(data.trailerUrl || '');
        setCinemas(data.cinemas || []);
      } else {
        alert('Film bulunamadı.');
        router.push('/admin/movies');
      }
    } catch (error) {
      console.error('Film verisi alınırken hata:', error);
      alert('Bir hata oluştu.');
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
        name: doc.data().name,  // Salon ismini burada alıyoruz
      }));
      setCinemaOptions(cinemaList);  // Salonları state'e ekliyoruz
    } catch (error) {
      console.error('Salonlar verisi alınırken hata:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'films', id), {
        title,
        genre,
        duration,
        releaseDate: Timestamp.fromDate(new Date(releaseDate)),
        description: summary,
        imgSrc,
        rating,
        slug,
        trailerUrl,
        cinemas, // güncel haliyle gönderiyoruz
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/movies');
      }, 2000);
    } catch (error) {
      console.error('Film güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/movies');
  };

  const handleCinemaChange = (index, field, value) => {
    const newCinemas = [...cinemas];
    newCinemas[index][field] = value;
    setCinemas(newCinemas);
  };

  const addCinema = () => {
    setCinemas([...cinemas, { id: '', showtime: '' }]);
  };

  const removeCinema = (index) => {
    setCinemas(cinemas.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-20 animate-pulse">Yükleniyor...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg mt-12 shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-8 text-center">🎬 Film Düzenle</h2>

      {[
        ['Film Başlığı', title, setTitle],
        ['Tür', genre, setGenre],
        ['Süre (dk)', duration, setDuration],
        ['Görsel URL', imgSrc, setImgSrc],
        ['Değerlendirme (16+ vs)', rating, setRating],
        ['Slug', slug, setSlug],
        ['Trailer URL', trailerUrl, setTrailerUrl],
      ].map(([label, value, setValue], i) => (
        <input
          key={i}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-700 border border-gray-600 rounded"
          placeholder={label}
        />
      ))}

      <input
        type="date"
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
        className="w-full p-4 mb-4 bg-gray-700 border border-gray-600 rounded"
      />

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full p-4 mb-6 h-32 resize-none bg-gray-700 border border-gray-600 rounded"
        placeholder="Özet"
      />

      <h3 className="text-xl font-semibold mb-4">🎥 Seanslar</h3>
      {cinemas.map((cinema, i) => (
        <div key={i} className="mb-4 bg-gray-800 p-4 rounded">
          <select
            value={cinema.id}
            onChange={(e) => handleCinemaChange(i, 'id', e.target.value)}
            className="w-full mb-2 p-2 bg-gray-700 border border-gray-600 rounded"
          >
            <option value="">Salon Seçin</option>
            {cinemaOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={cinema.showtime}
            onChange={(e) => handleCinemaChange(i, 'showtime', e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <button
            onClick={() => removeCinema(i)}
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Seansı Kaldır
          </button>
        </div>
      ))}
      <button
        onClick={addCinema}
        className="mb-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        + Seans Ekle
      </button>

      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="bg-gray-600 px-5 py-2 rounded hover:bg-gray-700"
        >
          İptal
        </button>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-700"
        >
          Güncelle
        </button>
      </div>

      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-green-400 text-center"
        >
          ✔️ Film başarıyla güncellendi!
        </motion.p>
      )}
    </motion.div>
  );
}
