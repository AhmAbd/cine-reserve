'use client';

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Link from "next/link";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FeaturedSlider() {
  const [movies, setMovies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const query = await getDocs(collection(db, "films"));
      const data = [];
      query.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setMovies(data);
    };
    fetchMovies();
  }, []);

  const handleSlideChange = (swiper) => {
    setSelectedIndex(swiper.realIndex);
  };

  if (!movies.length) return null;

  return (
    <section className="relative bg-[#1f1f1f] text-white">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        navigation
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
        loop
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.slug}>
            <div className="w-full bg-[#1f1f1f] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-6 md:p-12 relative">
              {/* Left Arrow */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <div
                  className="cursor-pointer bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-[#a020f0] transition"
                  onClick={() => swiperRef.current?.slidePrev()}
                >
                  ◀
                </div>
              </div>

              {/* Trailer */}
              <div className="w-full md:w-1/2 h-[280px] md:h-[400px]">
                <iframe
                  src={movie.trailerUrl}
                  title={movie.title}
                  className="w-full h-full rounded-xl"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
                  onMouseLeave={() => swiperRef.current?.autoplay?.start()}
                ></iframe>
              </div>

              {/* Movie Info */}
              <div className="w-full md:w-1/2">
                <p className="text-sm text-[#a020f0] font-medium mb-1">Vizyonda</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>

                <div className="flex flex-wrap gap-2 text-xs font-medium mb-4">
                  <span className="bg-[#a020f0] text-white px-3 py-1 rounded-full">{movie.genre}</span>
                  <span className="bg-gray-700 text-white px-3 py-1 rounded-full">{movie.duration}</span>
                  <span className="bg-gray-700 text-white px-3 py-1 rounded-full">{movie.rating}</span>
                </div>

                <p className="text-gray-300 text-sm mb-6 max-w-xl">{movie.description}</p>

                <div className="flex gap-4">
                  <Link
                    href={`/tickets?movie=${movie.id}`}
                    className="bg-[#a020f0] px-6 py-2 rounded-full font-semibold text-white hover:bg-purple-700 transition"
                  >
                    Hemen Bilet Al
                  </Link>
                  <Link
                    href={`/movies/${movie.slug}`}
                    className="border border-gray-300 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 hover:text-black transition"
                  >
                    İncele
                  </Link>
                </div>
              </div>

              {/* Right Arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                <div
                  className="cursor-pointer bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-[#a020f0] transition"
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  ▶
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-prev,
        .swiper-button-next {
          display: none;
        }
        .swiper-pagination-bullet {
          background: #666;
          opacity: 0.6;
        }
        .swiper-pagination-bullet-active {
          background: #a020f0;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
