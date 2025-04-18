'use client';

import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      const snapshot = await getDocs(collection(db, "films"));
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMovies(list);
      setFiltered(list);
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, movies]);

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Tüm Filmler</h1>
        <div className="w-24 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Film ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#a020f0] transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filtered.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.slug}`}>
            <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
              <img
                src={movie.imgSrc}
                alt={movie.title}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-semibold">{movie.title}</h2>
              <p className="text-sm text-gray-400">{movie.genre} • {movie.duration}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Film bulunamadı.</p>
      )}
    </div>
  );
}
