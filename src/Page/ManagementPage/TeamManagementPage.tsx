import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        const response = await Promise.resolve([]);
        setTeams(response);
      } catch (error) {
        console.error("Failed to fetch teams", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading teams..." />;
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
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p>Manage your teams here.</p>
          {/* Add team list and form components here */}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;
