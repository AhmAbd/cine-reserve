"use client";
import { motion } from "framer-motion";
import MovieList from "../components/MovieList";
import CinemaList from "../components/CinemaList";
import FeaturedSlider from "../components/FeaturedSlider";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e] text-white overflow-hidden">
      {/* Featured Slider with decorative elements */}
      <section className="relative">
        <FeaturedSlider />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a2e] to-transparent pointer-events-none z-20" />
      </section>

      {/* Main content with staggered animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="space-y-16 pb-16"
      >
        {/* Decorative section dividers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MovieList />
          <div className="max-w-7xl mx-auto px-4 pt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CinemaList />
          <div className="max-w-7xl mx-auto px-4 pt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent" />
          </div>
        </motion.div>

        {/* Call-to-Action Section */}
        <motion.section
          className="max-w-7xl mx-auto px-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-4 font-cinematic">
            Sinema Keyfini Keşfedin
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            En yeni filmler ve özel salon deneyimleri için biletinizi şimdi
            alın.
          </p>
          <Link href="/movies" passHref>
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold uppercase tracking-wide shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bilet Al
            </motion.button>
          </Link>
        </motion.section>
      </motion.div>

      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600 filter blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-indigo-600 filter blur-3xl" />
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap");

        .font-cinematic {
          font-family: "Montserrat", sans-serif;
        }
      `}</style>
    </main>
  );
}
