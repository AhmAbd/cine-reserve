// app/movies/page.jsx

import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default async function MoviesPage() {
  const querySnapshot = await getDocs(collection(db, "films"));
  const movies = [];

  querySnapshot.forEach((docSnap) => {
    movies.push({ id: docSnap.id, ...docSnap.data() });
  });

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">Tüm Filmler</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {movies.map((movie) => (
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
    </div>
  );
}
