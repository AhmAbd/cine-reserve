import React from "react";
import CinemaCard from "./CinemaCard.jsx";

const CinemaList = () => {
  const cinemas = [
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Grand Cinema",
      location: "City Center, City B",
      imgSrc:
        "https://images.unsplash.com/photo-1566315264-c115238b0322?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjMw&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Theater 360",
      location: "Uptown, City C",
      imgSrc:
        "https://images.unsplash.com/photo-1581375762164-e609d16f97db?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjI2&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      name: "Cineplex",
      location: "Downtown, City A",
      imgSrc:
        "https://images.unsplash.com/photo-1531326736783-c556d56b0037?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGluY2x1c2l2ZSUyMGV4cGVyaWVuY2V8ZW58MHx8fHwxNjc4NDczMjA1&ixlib=rb-1.2.1&q=80&w=400",
    },
  ];

  return (
    <section className="py-8 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6">Ayrıcalıklı Salonlar</h2>
        <div className="flex overflow-x-auto gap-8">
          {cinemas.map((cinema, index) => (
            <CinemaCard key={index} cinema={cinema} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CinemaList;
