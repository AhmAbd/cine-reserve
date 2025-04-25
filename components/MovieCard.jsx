'use client';
import React from "react";
import { motion } from "framer-motion";

const MovieCard = ({ movie, showtime, isHovered }) => {
  return (
    <motion.div 
      className="bg-[#1a1a2e] rounded-xl shadow-lg overflow-hidden flex-shrink-0 w-64 h-[410px] flex flex-col relative"
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)" }}
      animate={{ 
        scale: isHovered ? 1.05 : 1,
        zIndex: isHovered ? 10 : 1
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Image with gradient overlay */}
      <div className="relative">
        <motion.img
          src={movie.imgSrc}
          alt={movie.title}
          className="w-full h-48 object-cover"
          animate={{
            filter: isHovered ? "brightness(1.1)" : "brightness(0.9)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Title */}
        <motion.h3 
          className="text-lg font-bold text-white mb-1"
          animate={{ color: isHovered ? "#a855f7" : "#ffffff" }}
        >
          {movie.title}
        </motion.h3>

        {/* Meta info */}
        <motion.p 
          className="text-sm text-gray-400 mb-1"
          animate={{ opacity: isHovered ? 0.9 : 0.7 }}
        >
          {movie.genre} • {movie.duration}
        </motion.p>

        {/* Optional Showtime */}
        {showtime && (
          <motion.p 
            className="text-sm text-[#a020f0] font-medium mb-2"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            🎬 {showtime}
          </motion.p>
        )}

        {/* Description */}
        <motion.p
          className="text-sm text-gray-300 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
          animate={{ opacity: isHovered ? 1 : 0.8 }}
        >
          {movie.description}
        </motion.p>

        {/* Hover effect indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default MovieCard;