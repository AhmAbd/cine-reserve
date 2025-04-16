'use client';
import React from "react";

<<<<<<< HEAD
const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64 h-96 flex flex-col">
=======
const MovieCard = ({ movie, showtime }) => {
  return (
    <div className="bg-[#2d3748] rounded-xl shadow-md overflow-hidden flex-shrink-0 w-64 h-[410px] flex flex-col hover:shadow-xl transition-shadow duration-300">
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
      <img
        src={movie.imgSrc}
        alt={movie.title}
        className="w-full h-48 object-cover"
      />
<<<<<<< HEAD
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="text-xl font-semibold text-white mb-2">
          {movie.title}
        </h3>
        <p
          className="text-gray-400 text-sm flex-grow overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3, // number of lines you want
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
=======

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
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
          }}
        >
          {movie.description}
        </p>
<<<<<<< HEAD

=======
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
      </div>
    </div>
  );
};

export default MovieCard;
