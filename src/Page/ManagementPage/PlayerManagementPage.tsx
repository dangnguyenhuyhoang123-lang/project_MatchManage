import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

const PlayerManagementPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        const response = await Promise.resolve([]);
        setPlayers(response);
      } catch (error) {
        console.error("Failed to fetch players", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading players..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
        >
          ← Back to Home
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Player Management</h1>
          <p>Manage your players here.</p>
          {/* Add player list and form components here */}
        </div>
      </div>
    </div>
  );
};

export default PlayerManagementPage;
