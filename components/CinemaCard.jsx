import React from "react";

const CinemaCard = ({ cinema }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64">
      <img
        src={cinema.imgSrc}
        alt={cinema.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white">{cinema.name}</h3>
        <p
          className="text-gray-400 text-sm flex-grow overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {cinema.location}
        </p>

      </div>
    </div>
  );
};

export default CinemaCard;
