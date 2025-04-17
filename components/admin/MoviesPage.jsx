'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'films'));
        const moviesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesList);
      } catch (error) {
        console.error('Error fetching movies: ', error);
      }
    };
    fetchMovies();
  }, []);

  // Arama filtresi
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Filmler</h2>

      {/* Arama alanı */}
      <input
        type="text"
        placeholder="Film ara"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border rounded-md"
      />

      {/* Filmler Listesi */}
      <ul>
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <li key={movie.id} className="mb-4">
              <p className="font-semibold">{movie.title}</p>
              <p className="text-sm text-gray-600">Tür: {movie.genre}</p>
              <p className="text-sm text-gray-600">Süre: {movie.duration} dk</p>
            </li>
          ))
        ) : (
          <p>No movies found</p> // Arama sonucu film bulunmazsa gösterilecek mesaj
        )}
      </ul>
    </div>
  );
}
