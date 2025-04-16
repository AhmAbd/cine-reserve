'use client';
import React, { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard.jsx";
<<<<<<< HEAD
import movies from "../data/movies.json";
=======
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
import Link from "next/link";

const MovieList = () => {
  const containerRef = useRef(null);
<<<<<<< HEAD
=======
  const [movies, setMovies] = useState([]);
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
  const [showButtons, setShowButtons] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

<<<<<<< HEAD
=======
  // ✅ Load JSON safely in the browser
  useEffect(() => {
    import("../data/movies.json").then((mod) => {
      setMovies(mod.default);
    });
  }, []);

>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setAtStart(scrollLeft <= 0);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, []);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const targetScroll = direction === "left"
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    smoothScrollTo(container, targetScroll, 500);
  };

  const smoothScrollTo = (element, target, duration) => {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollLeft = start + change * easeInOutQuad(progress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const easeInOutQuad = (t) => t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;

<<<<<<< HEAD
=======
  if (!movies.length) return null;

>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
  return (
    <section
      className="py-8 relative group"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6">
          Vizyondakiler
        </h2>

        {showButtons && (
          <button
            onClick={() => scroll("left")}
            disabled={atStart}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg z-10 transition-opacity ${
              atStart ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            ◀
          </button>
        )}

        {showButtons && (
          <button
            onClick={() => scroll("right")}
            disabled={atEnd}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg z-10 transition-opacity ${
              atEnd ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            ▶
          </button>
        )}

        <div
          ref={containerRef}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="flex overflow-x-auto gap-8"
        >
          {movies.map((movie, index) => (
            <Link key={movie.id || index} href={`/movies/${movie.slug}`}>
<<<<<<< HEAD
            <div className="transition-transform transform hover:scale-105">
              <MovieCard movie={movie} />
            </div>
          </Link>
=======
              <div className="transition-transform transform hover:scale-105">
                <MovieCard movie={movie} />
              </div>
            </Link>
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieList;
