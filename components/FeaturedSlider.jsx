'use client';

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FeaturedSlider() {
  const [movies, setMovies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);
  const swiperRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const query = await getDocs(collection(db, "films"));
      const data = [];
      query.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      console.log("Movies Data:", data); // Debug: Log movies to check posterUrl
      setMovies(data);
    };
    fetchMovies();
  }, []);

  const handleSlideChange = (swiper) => {
    setSelectedIndex(swiper.realIndex);
    setIsFullScreenVideo(false); // Reset full-screen mode on slide change
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    setIsFullScreenVideo(true);
  };

  const handleIframeMessage = (event, index) => {
    if (event.data === 0 || event.data === 2) { // 0: ended, 2: paused (YouTube Player API)
      if (selectedIndex === index) {
        setIsFullScreenVideo(false);
      }
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        handleIframeMessage(event, selectedIndex);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedIndex]);

  if (!movies.length) return null;

  return (
    <section className="relative bg-[#1a1a2e] text-white py-12 overflow-hidden">
      <div className="relative">
        <Swiper
          modules={[Navigation, Autoplay, Pagination, EffectFade]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          navigation={false}
          autoplay={{ 
            delay: 8000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          pagination={{ 
            clickable: true,
            el: '.swiper-pagination',
            type: 'bullets',
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          speed={1200}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
          loop
          loopAdditionalSlides={1}
          watchSlidesProgress
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={`${movie.slug}-${index}`}>
              <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center bg-black">
                {/* Poster Image */}
                <motion.img
                  src={movie.posterUrl || 'https://via.placeholder.com/1920x1080'}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover filter blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Full-Screen Video */}
                {isFullScreenVideo && selectedIndex === index && (
                  <motion.div
                    className="fixed top-0 left-0 w-screen h-screen z-50 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <iframe
                      ref={iframeRef}
                      src={`${movie.trailerUrl}?autoplay=1&enablejsapi=1`}
                      title={movie.title}
                      className="w-full h-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <motion.div
                      className="absolute top-4 right-4 bg-[#2a2a4a] text-white p-2 rounded-full cursor-pointer z-60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullScreenVideo(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}

                {/* Play Button Overlay */}
                {!isFullScreenVideo && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  >
                    <motion.div
                      className="bg-white bg-opacity-20 backdrop-blur-md rounded-full p-4 cursor-pointer pointer-events-auto"
                      whileHover={{ scale: 1.1 }}
                      onClick={handleTrailerClick}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20">
                        <defs>
                          <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#a020f0", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <path
                          fill="url(#playGradient)"
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}

                {/* Movie Info Overlay */}
                {!isFullScreenVideo && (
                  <motion.div
                    className="relative z-30 container mx-auto px-4 flex flex-col justify-center h-full"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="max-w-lg">
                      <span className="text-sm uppercase tracking-wider text-[#a020f0] font-semibold mb-2 inline-block">
                        VİZYONDA
                      </span>
                      <h1 className="text-4xl md:text-6xl font-bold text-white uppercase mb-4">
                        {movie.title}
                      </h1>
                      <p className="text-gray-300 text-base mb-4 leading-relaxed">
                        {movie.description}
                      </p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-white text-sm">{movie.rating || "N/A"}</span>
                        <span className="text-white text-sm">{movie.genre}</span>
                        <span className="text-white text-sm">{movie.duration}</span>
                      </div>
                      <div className="flex gap-4">
                        <Link href={`/tickets?movie=${movie.id}`}>
                          <motion.button
                            className="bg-[#a020f0] text-white px-6 py-3 rounded-md font-semibold uppercase tracking-wide flex items-center gap-2"
                            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(160, 32, 240, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                            </svg>
                            Hemen Bilet Al
                          </motion.button>
                        </Link>
                        <Link href={`/movies/${movie.slug}`}>
                          <motion.button
                            className="border border-white text-white px-6 py-3 rounded-md font-semibold uppercase tracking-wide flex items-center gap-2"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            İncele
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Left Arrow */}
        <motion.div 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="swiper-button-prev-1 cursor-pointer bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full transition-all flex items-center justify-center w-12 h-12"
            whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="arrowGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#a020f0", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                stroke="url(#arrowGradientLeft)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Right Arrow */}
        <motion.div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="swiper-button-next-1 cursor-pointer bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full transition-all flex items-center justify-center w-12 h-12"
            whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="arrowGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#a020f0", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                stroke="url(#arrowGradientRight)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Custom Pagination */}
        <div className="swiper-pagination !relative !bottom-0 !mt-4 flex justify-center"></div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #fff;
          opacity: 0.5;
          margin: 0 5px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          width: 10px;
          height: 10px;
          background: #fff;
          opacity: 1;
        }
        .swiper-slide {
          background: transparent !important; /* Ensure Swiper slide doesn't override background */
        }
      `}</style>
    </section>
  );
}