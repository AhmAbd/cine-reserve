'use client';

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import MovieCard from "./MovieCard.jsx";
import Link from "next/link";

const MovieList = () => {
  const containerRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "films"));
        const movieList = querySnapshot.docs.map((doc) => doc.data());
        setMovies(movieList);
      } catch (error) {
        console.error("Failed to fetch films:", error);
      }
    };

    fetchMovies();
  }, []);

  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setAtStart(scrollLeft <= 10); // Added small buffer
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 10); // Added small buffer
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [movies]); // Added movies as dependency to recalculate when data loads

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth;
    const targetScroll = container.scrollLeft + scrollAmount;

    // Ensure we don't scroll past boundaries
    const maxScroll = container.scrollWidth - container.clientWidth;
    const boundedTarget = Math.max(0, Math.min(targetScroll, maxScroll));

    smoothScrollTo(container, boundedTarget, 500);
  };

  const smoothScrollTo = (element, target, duration) => {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);
      element.scrollLeft = start + change * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Force recheck of scroll position after animation completes
        checkScrollPosition();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  if (!movies.length) return null;

  return (
    <motion.section
      className="py-12 relative group"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-white mb-8 font-cinematic"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Vizyondakiler
          <motion.div 
            className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mt-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
        </motion.h2>

        <AnimatePresence>
          {showButtons && (
            <motion.button
              onClick={() => scroll("left")}
              disabled={atStart}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-purple-400 p-4 rounded-full shadow-lg z-10 transition-all duration-300 ${
                atStart ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:scale-110"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: atStart ? 0.3 : 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButtons && (
            <motion.button
              onClick={() => scroll("right")}
              disabled={atEnd}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-purple-400 p-4 rounded-full shadow-lg z-10 transition-all duration-300 ${
                atEnd ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:scale-110"
              }`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: atEnd ? 0.3 : 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={containerRef}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="flex overflow-x-auto gap-8 no-scrollbar pb-4 scroll-smooth" // Added scroll-smooth
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.slug || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              onMouseEnter={() => setIsHovered(index)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <Link href={`/movies/${movie.slug}`}>
                <MovieCard movie={movie} isHovered={isHovered === index} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default MovieList;