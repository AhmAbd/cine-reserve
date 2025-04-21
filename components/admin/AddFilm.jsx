'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const generateSlug = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const isValidImageUrl = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

export default function AddFilm() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemas, setSelectedCinemas] = useState([]);
  const [cinemaShowtimes, setCinemaShowtimes] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cinemas'));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setCinemas(data);
      } catch (error) {
        console.error("Sinema salonları alınırken hata oluştu:", error);
        setMessage("❌ Sinema verisi alınırken hata oluştu.");
      }
    };

    fetchCinemas();
  }, []);

  const handleCinemaSelect = (e) => {
    const id = e.target.value;
    if (!selectedCinemas.includes(id)) {
      setSelectedCinemas([...selectedCinemas, id]);
    }
  };

  const handleRemoveCinema = (id) => {
    setSelectedCinemas(selectedCinemas.filter((cid) => cid !== id));
    const newShowtimes = { ...cinemaShowtimes };
    delete newShowtimes[id];
    setCinemaShowtimes(newShowtimes);
  };

  const handleShowtimeChange = (cinemaId, value) => {
    setCinemaShowtimes((prev) => ({
      ...prev,
      [cinemaId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!posterUrl || !isValidImageUrl(posterUrl)) {
      setMessage('❌ Geçerli bir afiş URL\'si girin.');
      return;
    }

    const slug = generateSlug(title);

    const cinemaArray = selectedCinemas.map((cinemaId) => ({
      id: cinemaId,
      showtime: cinemaShowtimes[cinemaId] || '',
    })).filter((c) => c.showtime);

    if (cinemaArray.length === 0) {
      setMessage('❌ En az bir sinema ve seans saati seçmelisiniz.');
      return;
    }

    try {
      // Film var mı kontrolü
      const existingFilmsSnapshot = await getDocs(collection(db, 'films'));
      const existingFilms = existingFilmsSnapshot.docs.map((doc) => doc.data());
      const isFilmExists = existingFilms.some((film) => film.slug === slug);

      if (isFilmExists) {
        setMessage('❌ Bu film zaten eklenmiş.');
        return;
      }

      await addDoc(collection(db, 'films'), {
        title,
        slug,
        genre,
        duration: `${duration} dk`,
        releaseDate: new Date(releaseDate),
        description: summary,
        trailerUrl,
        imgSrc: posterUrl,
        rating,
        cinemas: cinemaArray,
        createdAt: serverTimestamp(),
      });

      setMessage('✅ Film eklendi!');
      setTitle('');
      setGenre('');
      setDuration('');
      setReleaseDate('');
      setSummary('');
      setRating('');
      setTrailerUrl('');
      setPosterUrl('');
      setSelectedCinemas([]);
      setCinemaShowtimes({});
    } catch (err) {
      console.error("Firebase Hatası: ", err);
      setMessage('❌ Hata: ' + err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-2xl text-white"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">🎬 Yeni Film Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { value: title, set: setTitle, placeholder: 'Film Adı' },
          { value: genre, set: setGenre, placeholder: 'Tür' },
          { value: duration, set: setDuration, placeholder: 'Süre (dk)', type: 'number' },
          { value: releaseDate, set: setReleaseDate, placeholder: 'Vizyon Tarihi', type: 'date' },
          { value: rating, set: setRating, placeholder: 'Puan (IMDB vb.)' },
          { value: trailerUrl, set: setTrailerUrl, placeholder: 'Fragman URL' },
          { value: posterUrl, set: setPosterUrl, placeholder: 'Poster URL' },
        ].map(({ value, set, placeholder, type = 'text' }, i) => (
          <input
            key={i}
            value={value}
            onChange={(e) => set(e.target.value)}
            placeholder={placeholder}
            type={type}
            className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        ))}

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Film Özeti"
          className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />

        <h3 className="text-lg font-semibold mt-6">🎥 Sinema Salonları</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Sinema ara..."
          className="w-full p-2 rounded bg-gray-700 text-white mb-2"
        />
        <select
          onChange={handleCinemaSelect}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="">Salon seç...</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>

        <div className="space-y-4 mt-4">
          {selectedCinemas.map((cinemaId) => {
            const cinema = cinemas.find((c) => c.id === cinemaId);
            return (
              <motion.div
                key={cinemaId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 p-4 rounded-xl shadow flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <strong>{cinema?.name}</strong>
                  <button
                    type="button"
                    onClick={() => handleRemoveCinema(cinemaId)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Kaldır
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={cinemaShowtimes[cinemaId] || ''}
                  onChange={(e) => handleShowtimeChange(cinemaId, e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </motion.div>
            );
          })}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 transition text-white font-bold py-3 rounded-xl mt-6 shadow-lg"
        >
          Filmi Ekle
        </button>
        {message && (
          <p className={`mt-4 text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </motion.div>
  );
}
