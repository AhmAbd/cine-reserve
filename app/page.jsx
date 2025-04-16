'use client';
import MovieList from "../components/MovieList";
import CinemaList from "../components/CinemaList";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      <MovieList />
      <CinemaList />
    </main>
  );
}
