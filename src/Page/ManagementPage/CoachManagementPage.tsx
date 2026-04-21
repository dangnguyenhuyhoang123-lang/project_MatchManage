import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Spinner/LoadingSpinner";

const CoachManagementPage = () => {
  const [coaches, setCoaches] = useState([
    { id: 1, name: "Coach A", team: "Team X" },
    { id: 2, name: "Coach B", team: "Team Y" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coach?")) {
      setCoaches((prev) => prev.filter((coach) => coach.id !== id));
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading coaches..." />;
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
          <h1 className="text-2xl font-bold">Coach Management</h1>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Team</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {coach.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {coach.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {coach.team}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(coach.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoachManagementPage;
