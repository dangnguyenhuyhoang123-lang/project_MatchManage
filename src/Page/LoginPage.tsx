import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const { setUser } = useAuth();

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({ username: "", password: "" });

    try {
      const response = await fetch(
        "http://localhost:8080/api/user-account/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: userName,
            password: passWord,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        setErrors((prev) => ({
          ...prev,
          [errorData.field]: errorData.message,
        }));

        return;
      }
      const meRes = await fetch("http://localhost:8080/api/user-account/me", {
        credentials: "include",
      });

      const user = await meRes.json();

      setUser(user);

      // alert("Đăng ký thành công");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {errors.username && (
              <p className="absolute text-red-500 text-sm mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
            />

            {errors.password && (
              <p className="absolute text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#" className="text-green-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 hover:shadow-md transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-400">or</div>

        {/* Social login */}
        <button className="w-full border py-2 rounded-lg hover:bg-gray-100 transition">
          Continue with Google
        </button>

        {/* Register */}
        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            to={`/sign-up`}
            className="text-green-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
