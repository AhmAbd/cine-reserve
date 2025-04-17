import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AddCinema() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleAddCinema = async () => {
    if (!name || !location) {
      setMessage('Tüm alanları doldurduğunuzdan emin olun.');
      return;
    }

    try {
      const cinemasRef = collection(db, 'cinemas');
      await addDoc(cinemasRef, {
        name,
        location,
        createdAt: new Date(),
      });

      setMessage('Sinema salonu başarıyla eklendi.');
      setName('');
      setLocation('');
    } catch (error) {
      setMessage('Bir hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="p-4 bg-black-100 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Sinema Salonu Ekle</h2>

      <div className="mb-4">
        <label className="block mb-2">Salon Adı</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Lokasyon</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={handleAddCinema}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        Ekle
      </button>

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
