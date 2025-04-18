'use client';

import { useEffect, useState } from 'react';
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
        console.log('Cinemas:', data);
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
      // Firestore’a film kaydet
      await addDoc(collection(db, 'films'), {
        title,
        slug,
        genre,
        duration: `${duration} dk`,
        releaseDate: new Date(releaseDate),
        description: summary,
        trailerUrl,
        imgSrc: posterUrl, // Poster URL burada eklenecek
        rating,
        cinemas: cinemaArray,
        createdAt: serverTimestamp(),
      });

      setMessage('✅ Film eklendi!');
      // Formu sıfırla
      setTitle('');
      setGenre('');
      setDuration('');
      setReleaseDate('');
      setSummary('');
      setRating('');
      setTrailerUrl('');
      setPosterUrl(''); // URL alanını sıfırlıyoruz
      setSelectedCinemas([]);
      setCinemaShowtimes({});
    } catch (err) {
      console.error("Firebase Hatası: ", err); // Hata detayı loglanıyor
      setMessage('❌ Hata: ' + err.message);
    }
  };

  return (
    <div className="p-6 rounded-md text-white">
      <h2 className="text-xl font-semibold mb-4">Yeni Film Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Film Adı"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Tür"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Süre (dk)"
          type="number"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          placeholder="Vizyon Tarihi"
          type="date"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Puan (IMDB vb.)"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={trailerUrl}
          onChange={(e) => setTrailerUrl(e.target.value)}
          placeholder="Fragman URL"
          className="w-full p-2 rounded bg-gray-800"
        />
        <input
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          placeholder="Poster URL"
          className="w-full p-2 rounded bg-gray-800"
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Film Özeti"
          className="w-full p-2 rounded bg-gray-800"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">Sinema Salonları</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Sinema ara..."
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
        />
        <select
          onChange={handleCinemaSelect}
          className="w-full p-2 bg-gray-700 rounded text-white"
        >
          <option value="">Salon seç...</option>
          {cinemas.length > 0 ? (
            cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))
          ) : (
            <option value="">Sinema bulunamadı</option>
          )}
        </select>

        <div className="mt-4 space-y-3">
          {selectedCinemas.map((cinemaId) => {
            const cinema = cinemas.find((c) => c.id === cinemaId);
            return (
              <div key={cinemaId} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <strong>{cinema?.name}</strong>
                  <button
                    type="button"
                    onClick={() => handleRemoveCinema(cinemaId)}
                    className="text-red-400 text-sm"
                  >
                    Kaldır
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={cinemaShowtimes[cinemaId] || ''}
                  onChange={(e) => handleShowtimeChange(cinemaId, e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="w-full bg-[#a020f0] py-2 rounded text-white font-semibold mt-4"
        >
          Filmi Ekle
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>
    </div>
  );
}
