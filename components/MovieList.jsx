import React from "react";
import MovieCard from "./MovieCard.jsx";

const MovieList = () => {
  const movies = [
    {
      title: "The Matrix Resurrections",
      description:
        "A mind-bending sci-fi thriller, where Neo is once again faced with the choice of reality and illusion in a world that is more complex than ever.",
      imgSrc:
        "https://images.unsplash.com/photo-1604908435362-7be9d64c3e6c?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI2NTc&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Spider-Man: No Way Home",
      description:
        "Spider-Man faces the consequences of his secret identity being exposed, teaming up with Doctor Strange to restore the multiverse and save his loved ones.",
      imgSrc:
        "https://images.unsplash.com/photo-1560781114-8a76e0914bb0?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3NDE&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Dune",
      description:
        "A young nobleman becomes embroiled in a war for the survival of his family and his people as he tries to take control of the desert planet, Arrakis.",
      imgSrc:
        "https://images.unsplash.com/photo-1566134264-5d4b4b74c9ff?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3Mzc&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Spider-Man: No Way Home",
      description:
        "Spider-Man faces the consequences of his secret identity being exposed, teaming up with Doctor Strange to restore the multiverse and save his loved ones.",
      imgSrc:
        "https://images.unsplash.com/photo-1560781114-8a76e0914bb0?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3NDE&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Dune",
      description:
        "A young nobleman becomes embroiled in a war for the survival of his family and his people as he tries to take control of the desert planet, Arrakis.",
      imgSrc:
        "https://images.unsplash.com/photo-1566134264-5d4b4b74c9ff?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3Mzc&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Spider-Man: No Way Home",
      description:
        "Spider-Man faces the consequences of his secret identity being exposed, teaming up with Doctor Strange to restore the multiverse and save his loved ones.",
      imgSrc:
        "https://images.unsplash.com/photo-1560781114-8a76e0914bb0?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3NDE&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Dune",
      description:
        "A young nobleman becomes embroiled in a war for the survival of his family and his people as he tries to take control of the desert planet, Arrakis.",
      imgSrc:
        "https://images.unsplash.com/photo-1566134264-5d4b4b74c9ff?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3Mzc&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Spider-Man: No Way Home",
      description:
        "Spider-Man faces the consequences of his secret identity being exposed, teaming up with Doctor Strange to restore the multiverse and save his loved ones.",
      imgSrc:
        "https://images.unsplash.com/photo-1560781114-8a76e0914bb0?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3NDE&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Dune",
      description:
        "A young nobleman becomes embroiled in a war for the survival of his family and his people as he tries to take control of the desert planet, Arrakis.",
      imgSrc:
        "https://images.unsplash.com/photo-1566134264-5d4b4b74c9ff?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3Mzc&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Spider-Man: No Way Home",
      description:
        "Spider-Man faces the consequences of his secret identity being exposed, teaming up with Doctor Strange to restore the multiverse and save his loved ones.",
      imgSrc:
        "https://images.unsplash.com/photo-1560781114-8a76e0914bb0?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3NDE&ixlib=rb-1.2.1&q=80&w=400",
    },
    {
      title: "Dune",
      description:
        "A young nobleman becomes embroiled in a war for the survival of his family and his people as he tries to take control of the desert planet, Arrakis.",
      imgSrc:
        "https://images.unsplash.com/photo-1566134264-5d4b4b74c9ff?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fG1vdmllfGVufDB8fHx8fDE2Nzg0NzI3Mzc&ixlib=rb-1.2.1&q=80&w=400",
    },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6">Vizyondakiler</h2>
        <div className="flex overflow-x-auto gap-8">
          {movies.map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieList;
