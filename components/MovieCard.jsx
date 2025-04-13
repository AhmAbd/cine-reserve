import React from "react";

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64">
      <img
        src={movie.imgSrc}
        alt={movie.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
        <p className="text-gray-400 mt-2">{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieCard;
