'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AddFilm() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Film verilerini Firebase'e kaydetme
      await addDoc(collection(db, 'films'), {
        title,
        genre,
        duration,
        releaseDate: new Date(releaseDate),
        summary,
      });

      setMessage('Film başarıyla eklendi!');
      // Formu temizle
      setTitle('');
      setGenre('');
      setDuration('');
      setReleaseDate('');
      setSummary('');
    } catch (error) {
      setMessage('Bir hata oluştu!');
      console.error('Error adding film: ', error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Film Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Film Adı */}
        <div>
          <label className="block text-sm font-medium mb-2">Film Adı</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            placeholder="Film adını girin"
          />
        </div>

        {/* Film Türü */}
        <div>
          <label className="block text-sm font-medium mb-2">Film Türü</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            placeholder="Film türünü girin"
          />
        </div>

        {/* Film Süresi */}
        <div>
          <label className="block text-sm font-medium mb-2">Film Süresi (dk)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            placeholder="Film süresini dakika olarak girin"
          />
        </div>

        {/* Çıkış Tarihi */}
        <div>
          <label className="block text-sm font-medium mb-2">Çıkış Tarihi</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Film Özeti */}
        <div>
          <label className="block text-sm font-medium mb-2">Özet</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            placeholder="Film özeti"
          ></textarea>
        </div>

        {/* Mesaj */}
        {message && <p className="text-sm text-green-600">{message}</p>}

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Filmi Ekle'}
        </button>
      </form>
    </div>
  );
}
