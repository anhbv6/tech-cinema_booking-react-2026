import ClientSidebar from "@/components/client/client-sidebar";
import HeaderSidebar from "@/components/client/header-sidebar";

export default function Home() {
  const topMovies = [
    { title: "The Shawshank...", genre: "Drama", rating: "9.2" },
    { title: "The Godfather", genre: "Crime • Drama", rating: "9.2" },
    { title: "The Dark Knight...", genre: "Action • Crime", rating: "9.0" },
  ];

  const genreChips = [
    "Action",
    "Fantasy",
    "Comedy",
    "Sci-Fi",
    "Drama",
    "Romance",
    "Mystery",
    "Horror",
  ];

  return (
    <div className="min-h-screen">
      <HeaderSidebar />
      <div>
        <ClientSidebar />
        
      </div>
    </div>
  );
}
