'use client';
import MovieList from "../components/MovieList";
import CinemaList from "../components/CinemaList";
import FeaturedSlider from "../components/FeaturedSlider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      <FeaturedSlider />
      <MovieList />
      <CinemaList />
    </main>
  );
}
