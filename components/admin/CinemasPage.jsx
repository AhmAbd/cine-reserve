'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cinemas'));
        const cinemasList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCinemas(cinemasList);
      } catch (error) {
        console.error('Error fetching cinemas: ', error);
      }
    };
    fetchCinemas();
  }, []);

  // Arama filtresi
  const filteredCinemas = cinemas.filter((cinema) =>
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Sinema Salonları</h2>

      {/* Arama alanı */}
      <input
        type="text"
        placeholder="Sinema salonu ara"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border rounded-md"
      />

      {/* Sinema Salonları Listesi */}
      <ul>
        {filteredCinemas.length > 0 ? (
          filteredCinemas.map((cinema) => (
            <li key={cinema.id} className="mb-4">
              <p className="font-semibold">{cinema.name}</p>
              <p className="text-sm text-gray-600">Lokasyon: {cinema.location}</p>
            </li>
          ))
        ) : (
          <p>No cinemas found</p> // Arama sonucu sinema salonu bulunmazsa gösterilecek mesaj
        )}
      </ul>
    </div>
  );
}
