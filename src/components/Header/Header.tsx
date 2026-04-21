import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import pic1 from "../../assets/user_icon.svg";

const Header = () => {
  const { user, setUser } = useAuth();
  return (
    <header className="bg-gray-900 text-white px-8 py-4">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <Link className="flex items-center gap-2" to={`/`}>
          <img src="/logo.png" className="w-8 h-8" />
          <span className="font-bold text-xl">PronoStats</span>
        </Link>

        {/* CENTER */}
        <nav className="flex gap-8 text-lg font-medium">
          <Link className="hover:text-yellow-400 cursor-pointer" to={`/`}>
            Home
          </Link>

          <a className="hover:text-yellow-400 cursor-pointer">Matches</a>

          <Link
            to={`/leagues`}
            className="hover:text-yellow-400 cursor-pointer"
          >
            Leagues
          </Link>

          <Link
            to={`/admin/matches`}
            className="hover:text-yellow-400 cursor-pointer"
          >
            Management
          </Link>
        </nav>
        {/* RIGHT */}

        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link to={`/login`}>
                <button className="bg-green-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-green-700 hover:scale-105 transition">
                  Login
                </button>
              </Link>

              <Link to={`/sign-up`}>
                <button className="bg-green-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-green-600 hover:scale-105 transition">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <>
              {/* Avatar */}
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-white/10"
              >
                <img
                  src={pic1}
                  className="w-9 h-9 rounded-full object-cover border"
                />

                {/* Info */}
                <div className="flex flex-col text-sm leading-tight">
                  <span className="font-semibold">{user.username}</span>

                  <span className="text-gray-400 text-xs">
                    {user.roles.includes("ROLE_ADMIN")
                      ? "Admin"
                      : user.roles.includes("ROLE_STAFF")
                        ? "Staff"
                        : "User"}
                  </span>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={() => setUser(null)}
                className="text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
