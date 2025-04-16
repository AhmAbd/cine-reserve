'use client';
import React from "react";

const MovieCard = ({ movie, showtime }) => {
  return (
    <div className="bg-[#2d3748] rounded-xl shadow-md overflow-hidden flex-shrink-0 w-64 h-[410px] flex flex-col hover:shadow-xl transition-shadow duration-300">
      <img
        src={movie.imgSrc}
        alt={movie.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-1">{movie.title}</h3>

        {/* Meta info */}
        <p className="text-sm text-gray-400 mb-1">
          {movie.genre} • {movie.duration}
        </p>

        {/* Optional Showtime */}
        {showtime && (
          <p className="text-sm text-[#a020f0] font-medium mb-2">🎬 {showtime}</p>
        )}

        {/* Description */}
        <p
          className="text-sm text-gray-300 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {movie.description}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
