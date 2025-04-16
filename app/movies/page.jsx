'use client';
import movies from "../../data/movies.json";
import MovieCard from "../../components/MovieCard";
import Link from "next/link";

export default function MovieListPage() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
    <h1 className="text-4xl font-bold text-center mb-2 text-white">Tüm Filmler</h1>
    <div className="w-16 h-1 bg-[#a020f0] mx-auto mb-8 rounded-full" />

      <div className="card-wrapper">
        {movies.map((movie) => (
          <Link key={movie.slug} href={`/movies/${movie.slug}`}>
            <div className="movie-card hover:scale-105 transition-transform">
              <MovieCard movie={movie} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
