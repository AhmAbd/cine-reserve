'use client';
import React from "react";

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64 h-96 flex flex-col">
      <img
        src={movie.imgSrc}
        alt={movie.title}
        className="w-full h-48 object-cover"
      />
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
          }}
        >
          {movie.description}
        </p>

      </div>
    </div>
  );
};

export default MovieCard;
