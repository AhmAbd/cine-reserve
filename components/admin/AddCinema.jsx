'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState(40);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const slug = generateSlug(name);
      await addDoc(collection(db, 'cinemas'), {
        name,
        slug,
        location,
        seats: Number(seats),
        createdAt: serverTimestamp()
      });

      setMessage('✅ Sinema başarıyla eklendi!');
      setName('');
      setLocation('');
      setSeats(40);
    } catch (err) {
      console.error(err);
      setMessage('❌ Hata oluştu: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Yeni Sinema Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sinema Adı"
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Google Maps Linki"
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />
        <input
          type="number"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          placeholder="Toplam Koltuk Sayısı"
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a020f0] py-2 rounded hover:bg-purple-700 transition"
        >
          {loading ? 'Yükleniyor...' : 'Sinema Ekle'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
