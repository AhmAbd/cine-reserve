'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const generateSlug = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function AddFilm() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemas, setSelectedCinemas] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      const querySnapshot = await getDocs(collection(db, 'cinemas'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setCinemas(data);
    };
    fetchCinemas();
  }, []);

  const handleCinemaToggle = (cinemaId) => {
    setSelectedCinemas((prev) => ({
      ...prev,
      [cinemaId]: prev[cinemaId] ? undefined : { showtime: '' }
    }));
  };

  const handleShowtimeChange = (cinemaId, value) => {
    setSelectedCinemas((prev) => ({
      ...prev,
      [cinemaId]: { ...prev[cinemaId], showtime: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = generateSlug(title);

    const cinemaArray = Object.entries(selectedCinemas)
      .filter(([_, data]) => data?.showtime)
      .map(([id, data]) => ({
        id,
        showtime: data.showtime,
      }));

    if (cinemaArray.length === 0) {
      setMessage('❌ Please select at least one cinema and showtime.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'films'), {
        title,
        slug,
        genre,
        duration: `${duration} dk`,
        releaseDate: new Date(releaseDate),
        description: summary,
        trailerUrl,
        imgSrc,
        rating,
        cinemas: cinemaArray,
        createdAt: serverTimestamp(),
      });

      for (const cinema of cinemaArray) {
        const cinemaDoc = await getDoc(doc(db, 'cinemas', cinema.id));
        const seatCount = cinemaDoc.data()?.seats || 40;

        const seats = {};
        for (let i = 1; i <= seatCount; i++) {
          seats[`A${i}`] = { available: true };
        }

        await setDoc(doc(db, 'cinema_seats', `${slug}_${cinema.id}`), {
          seats,
        });
      }

      setMessage('✅ Film added and seats generated!');
      // Do not reset form fields so user can reuse values
    } catch (err) {
      console.error(err);
      setMessage('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="p-6 rounded-md text-white">
      <h2 className="text-xl font-semibold mb-4">Add New Film</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 rounded bg-gray-800" />
        <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="w-full p-2 rounded bg-gray-800" />
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" type="number" className="w-full p-2 rounded bg-gray-800" />
        <input value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} placeholder="Release Date" type="date" className="w-full p-2 rounded bg-gray-800" />
        <input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Rating" className="w-full p-2 rounded bg-gray-800" />
        <input value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} placeholder="Trailer URL" className="w-full p-2 rounded bg-gray-800" />
        <input value={imgSrc} onChange={(e) => setImgSrc(e.target.value)} placeholder="Image URL" className="w-full p-2 rounded bg-gray-800" />
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Description" className="w-full p-2 rounded bg-gray-800" />

        <h3 className="text-lg font-semibold mt-6 mb-2">Assign Cinemas</h3>
        {cinemas.map((cinema) => (
          <div key={cinema.id} className="mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!selectedCinemas[cinema.id]}
                onChange={() => handleCinemaToggle(cinema.id)}
              />
              {cinema.name}
            </label>
            {selectedCinemas[cinema.id] && (
              <input
                type="datetime-local"
                value={selectedCinemas[cinema.id]?.showtime || ''}
                onChange={(e) => handleShowtimeChange(cinema.id, e.target.value)}
                className="mt-2 block p-1 w-full bg-gray-700 text-white rounded"
              />
            )}
          </div>
        ))}

        <button type="submit" className="w-full bg-[#a020f0] py-2 rounded text-white font-semibold">
          Add Film
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>
    </div>
  );
}
