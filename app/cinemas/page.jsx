'use client';
import cinemas from "../../data/cinemas.json";
import CinemaCard from "../../components/CinemaCard";
import Link from "next/link";

export default function CinemaListPage() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
    <div className="text-center mb-10">
    <h1 className="text-4xl font-bold text-white mb-2">Tüm Sinemalar</h1>
    <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
    </div>

      <div className="card-wrapper">
        {cinemas.map((cinema) => (
          <Link key={cinema.slug} href={`/cinemas/${cinema.slug}`}>
            <div className="cinema-card hover:scale-105 transition-transform">
              <CinemaCard cinema={cinema} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
