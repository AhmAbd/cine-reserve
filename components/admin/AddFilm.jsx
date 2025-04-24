'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const generateSlug = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const isValidImageUrl = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

export default function AddFilm() {
  // Film bilgileri
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');

  // Sinema ve salon bilgileri
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [cinemaHalls, setCinemaHalls] = useState([]); // Sinemanın salonları
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [hallShowtimes, setHallShowtimes] = useState({});

  // UI durumları
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cinemas'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCinemas(data);
      } catch (error) {
        console.error("Sinema salonları alınırken hata:", error);
        setMessage("❌ Sinema verisi alınırken hata oluştu");
      }
    };

    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinema) {
      // Seçilen sinemanın hallNumber bilgilerini al
      const selected = cinemas.find(c => c.id === selectedCinema);
      if (selected && selected.hallNumber) {
        // Eğer hallNumber string ise array'e çevir
        const halls = typeof selected.hallNumber === 'string' 
          ? [selected.hallNumber] 
          : selected.hallNumber || [];
        
        setCinemaHalls(halls.map((hall, index) => ({
          id: `${selectedCinema}-${index}`,
          name: hall,
          cinemaId: selectedCinema
        })));
      } else {
        setCinemaHalls([]);
      }
    } else {
      setCinemaHalls([]);
    }
  }, [selectedCinema, cinemas]);

  const handleCinemaSelect = (e) => {
    setSelectedCinema(e.target.value);
    setSelectedHalls([]);
    setHallShowtimes({});
  };

  const handleHallSelect = (e) => {
    const hallId = e.target.value;
    if (hallId && !selectedHalls.includes(hallId)) {
      setSelectedHalls([...selectedHalls, hallId]);
    }
  };

  const handleRemoveHall = (hallId) => {
    setSelectedHalls(selectedHalls.filter(id => id !== hallId));
    const newShowtimes = { ...hallShowtimes };
    delete newShowtimes[hallId];
    setHallShowtimes(newShowtimes);
  };

  const handleShowtimeChange = (hallId, value) => {
    setHallShowtimes(prev => ({
      ...prev,
      [hallId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validasyonlar
    if (!posterUrl || !isValidImageUrl(posterUrl)) {
      setMessage('❌ Geçerli bir afiş URL\'si girin.');
      setLoading(false);
      return;
    }

    if (selectedHalls.length === 0) {
      setMessage('❌ En az bir salon seçmelisiniz.');
      setLoading(false);
      return;
    }

    const slug = generateSlug(title);

    try {
      // Film var mı kontrolü
      const filmsQuery = query(
        collection(db, 'films'),
        where('slug', '==', slug)
      );
      const querySnapshot = await getDocs(filmsQuery);
      
      if (!querySnapshot.empty) {
        setMessage('❌ Bu film zaten eklenmiş.');
        setLoading(false);
        return;
      }

      // Sinema salonu bilgilerini hazırla
      const hallsData = selectedHalls.map(hallId => {
        const hall = cinemaHalls.find(h => h.id === hallId);
        return {
          id: selectedCinema,
          hallId: hallId,
          hallNumber: hall?.name || `Salon ${hallId}`,
          showtime: hallShowtimes[hallId] || ''
        };
      }).filter(hall => hall.showtime);

      if (hallsData.length === 0) {
        setMessage('❌ Seçili salonlar için seans saati girin.');
        setLoading(false);
        return;
      }

      // Yeni film ekle
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
        language,
        director,
        cast: cast.split(',').map(name => name.trim()).filter(name => name),
        cinemas: hallsData,
        createdAt: serverTimestamp()
      });

      setMessage('✅ Film başarıyla eklendi!');
      // Formu sıfırla
      setTitle('');
      setGenre('');
      setDuration('');
      setReleaseDate('');
      setSummary('');
      setRating('');
      setTrailerUrl('');
      setPosterUrl('');
      setLanguage('');
      setDirector('');
      setCast('');
      setSelectedCinema('');
      setCinemaHalls([]);
      setSelectedHalls([]);
      setHallShowtimes({});
    } catch (err) {
      console.error("Film eklenirken hata:", err);
      setMessage('❌ Hata: ' + err.message);
    } finally {
      setLoading(false);
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
        {/* Temel Film Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: title, set: setTitle, placeholder: 'Film Adı*', required: true },
            { value: genre, set: setGenre, placeholder: 'Tür*', required: true },
            { value: duration, set: setDuration, placeholder: 'Süre (dk)*', type: 'number', required: true },
            { value: releaseDate, set: setReleaseDate, placeholder: 'Vizyon Tarihi*', type: 'date', required: true },
            { value: rating, set: setRating, placeholder: 'Puan (IMDB vb.)' },
            { value: language, set: setLanguage, placeholder: 'Dil*', required: true },
            { value: director, set: setDirector, placeholder: 'Yönetmen*', required: true },
            { value: cast, set: setCast, placeholder: 'Oyuncular (virgülle ayırın)' },
          ].map((field, i) => (
            <input
              key={i}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              type={field.type || 'text'}
              required={field.required}
              className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          ))}
        </div>

        {/* Medya URL'leri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="Fragman URL"
            type="url"
            className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="Poster URL*"
            type="url"
            required
            className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Özet */}
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Film Özeti*"
          required
          className="w-full p-3 rounded-xl bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          rows={4}
        />

        {/* Sinema ve Salon Seçimi */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">🎥 Sinema ve Salon Seçimi</h3>
          
          {/* Sinema Seçimi */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Sinema Seçin</label>
            <select
              value={selectedCinema}
              onChange={handleCinemaSelect}
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            >
              <option value="">Sinema seçin...</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          </div>

          {/* Salon Seçimi (sadece sinema seçildiğinde görünür) */}
          {selectedCinema && cinemaHalls.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Salon Seçin</label>
              <select
                onChange={handleHallSelect}
                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">Salon seçin...</option>
                {cinemaHalls.map(hall => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Seçili Salonlar */}
          <div className="space-y-3 mt-4">
            {selectedHalls.map(hallId => {
              const hall = cinemaHalls.find(h => h.id === hallId);
              return (
                <motion.div
                  key={hallId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 p-4 rounded-xl border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <strong>{hall?.name || `Salon ${hallId}`}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHall(hallId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Kaldır
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={hallShowtimes[hallId] || ''}
                    onChange={(e) => handleShowtimeChange(hallId, e.target.value)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </motion.div>
              );
            })}
          </div>

          {selectedCinema && cinemaHalls.length === 0 && (
            <div className="text-yellow-400 text-sm mt-2">
              Bu sinemada tanımlı salon bulunamadı. Lütfen sinema yönetiminden salon eklemesini isteyin.
            </div>
          )}
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl mt-6 transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '⏳ Ekleniyor...' : 'Filmi Ekle'}
        </button>

        {/* Mesaj */}
        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.startsWith('✅') ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </p>
        )}
      </form>
    </motion.div>
  );
}