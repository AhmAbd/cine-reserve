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
      console.log("Movies Data:", data);
      setMovies(data);
    };
    fetchMovies();
  }, []);

  const handleSlideChange = (swiper) => {
    setSelectedIndex(swiper.realIndex);
    setIsFullScreenVideo(false);
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    setIsFullScreenVideo(true);
  };

  const handleIframeMessage = (event, index) => {
    if (event.data === 0 || event.data === 2) {
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

  const getEmbedUrl = (url) => {
    try {
      if (!url) return null;
      let videoId;
      if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      } else {
        videoId = url.split('/').pop();
      }
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error("Error processing trailer URL:", url, error);
      return null;
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (!movies.length) return null;

  return (
    <section className="relative bg-[#0d0d1a] text-white py-8 overflow-hidden">
      <div className="relative">
        <Swiper
          modules={[Navigation, Autoplay, Pagination, EffectFade]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          navigation={false}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
            type: 'bullets',
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          speed={1200}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
          loop
          loopAdditionalSlides={1}
          watchSlidesProgress
        >
          {movies.map((movie, index) => {
            const embedUrl = getEmbedUrl(movie.trailerUrl);
            const thumbnailUrl = movie.trailerUrl
              ? `https://img.youtube.com/vi/${
                  movie.trailerUrl.includes('watch?v=')
                    ? movie.trailerUrl.split('v=')[1]?.split('&')[0]
                    : movie.trailerUrl.split('/').pop()
                }/maxresdefault.jpg`
              : null;

            return (
              <SwiperSlide key={`${movie.slug}-${index}`}>
                <div className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center">
                  {/* Enhanced Background Layers */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Blurred Background Layer */}
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      style={{
                        backgroundImage: `url(${
                          thumbnailUrl ||
                          movie.posterUrl ||
                          'https://via.placeholder.com/1920x1080'
                        })`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(20px) brightness(0.7)',
                        transform: 'scale(1.1)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                  </div>

                  {/* Main Sharp Image */}
                  <motion.div
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <img
                      src={
                        thumbnailUrl ||
                        movie.posterUrl ||
                        'https://via.placeholder.com/1920x1080'
                      }
                      alt={`${movie.title} Background`}
                      className="w-full h-full object-cover brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </motion.div>

                  {/* Full-Screen Video */}
                  {isFullScreenVideo && selectedIndex === index && (
                    <motion.div
                      className="fixed inset-0 w-screen h-screen z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-black">
                        <iframe
                          ref={iframeRef}
                          src={`${embedUrl}?autoplay=1&enablejsapi=1`}
                          title={movie.title}
                          className="w-full h-full object-cover"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <motion.button
                        className="absolute top-6 right-6 bg-black/70 text-white p-3 rounded-full cursor-pointer z-60 hover:bg-black/90 transition-all duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullScreenVideo(false);
                        }}
                        aria-label="Close trailer"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Play Button Overlay */}
                  {!isFullScreenVideo && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <motion.div
                        className="relative flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-5 cursor-pointer pointer-events-auto border-4 border-white/20 shadow-2xl hover:border-white/40 transition-all duration-300"
                        whileHover={{ scale: 1.15, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={handleTrailerClick}
                        aria-label="Play trailer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Movie Info Overlay */}
                  {!isFullScreenVideo && (
                    <motion.div
                      className="absolute z-30 top-1/2 left-8 md:left-12 -translate-y-1/2 w-full max-w-[700px] flex flex-col"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <motion.span
                        className="text-base md:text-lg uppercase tracking-widest text-purple-400 font-semibold mb-4 drop-shadow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        VİZYONDA
                      </motion.span>
                      <motion.h1
                        className="text-5xl md:text-7xl font-extrabold text-white uppercase mb-6 leading-tight drop-shadow-lg line-clamp-2 font-cinematic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {movie.title}
                      </motion.h1>
                      <motion.p
                        className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed drop-shadow line-clamp-3 font-cinematic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        {truncateText(movie.description, 150)}
                      </motion.p>
                      <motion.div
                        className="flex items-center gap-6 mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <span className="text-white text-base md:text-lg font-medium drop-shadow">
                          {movie.rating || "N/A"}
                        </span>
                        <span className="text-white text-base md:text-lg font-medium drop-shadow">
                          {movie.genre}
                        </span>
                        <span className="text-white text-base md:text-lg font-medium drop-shadow">
                          {movie.duration}
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <Link href={`/tickets?movie=${movie.id}`}>
                          <motion.button
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold uppercase tracking-wide flex items-center gap-3 shadow-lg text-lg hover:shadow-purple-500/30 transition-all duration-300"
                            whileHover={{
                              scale: 1.05,
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                            </svg>
                            Hemen Bilet Al
                          </motion.button>
                        </Link>
                        <Link href={`/movies/${movie.slug}`}>
                          <motion.button
                            className="border-2 border-gray-400/50 text-white px-8 py-4 rounded-lg font-semibold uppercase tracking-wide flex items-center gap-3 bg-black/40 hover:bg-white/10 hover:border-white/80 text-lg transition-all duration-300"
                            whileHover={{
                              scale: 1.05,
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            İncele
                          </motion.button>
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation Arrows */}
        <motion.div
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.button
            className="swiper-button-prev-1 cursor-pointer bg-black/50 text-purple-400 p-4 rounded-full shadow-lg border border-gray-600/50 hover:bg-black/70 hover:border-purple-400/50 transition-all duration-300"
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-400"
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
        </motion.div>

        <motion.div
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.button
            className="swiper-button-next-1 cursor-pointer bg-black/50 text-purple-400 p-4 rounded-full shadow-lg border border-gray-600/50 hover:bg-black/70 hover:border-purple-400/50 transition-all duration-300"
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-400"
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
        </motion.div>

        {/* Custom Pagination */}
        <div className="swiper-pagination !relative !bottom-0 !mt-6 flex justify-center"></div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');

        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          margin: 0 6px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #ffffff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          transform: scale(1.2);
        }
        .swiper-slide {
          background: transparent !important;
        }
        iframe {
          border: none;
        }
        .drop-shadow {
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }
        .drop-shadow-lg {
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.7);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .font-cinematic {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>
    </section>
  );
}