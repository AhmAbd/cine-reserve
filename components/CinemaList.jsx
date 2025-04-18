'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import CinemaCard from './CinemaCard';

const CinemaList = () => {
  const containerRef = useRef(null);
  const [cinemas, setCinemas] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const fetchCinemas = async () => {
      const snapshot = await getDocs(collection(db, 'cinemas'));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCinemas(list);
    };

    fetchCinemas();
  }, []);

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

    container.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, []);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const targetScroll =
      direction === 'left'
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

  const easeInOutQuad = (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  if (!cinemas.length) {
    return <div className="text-white py-10 text-center">Yükleniyor...</div>;
  }

  return (
    <section
      className="py-8 relative group"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6">
          Ayrıcalıklı Salonlar
        </h2>

        {showButtons && (
          <button
            onClick={() => scroll('left')}
            disabled={atStart}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg z-10 transition-opacity ${
              atStart ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
            }`}
          >
            ◀
          </button>
        )}

        {showButtons && (
          <button
            onClick={() => scroll('right')}
            disabled={atEnd}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg z-10 transition-opacity ${
              atEnd ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
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
          {cinemas.map((cinema) => (
            <Link key={cinema.id} href={`/cinemas/${cinema.id}`}>
              <div className="transition-transform transform hover:scale-105">
                <CinemaCard cinema={cinema} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CinemaList;
