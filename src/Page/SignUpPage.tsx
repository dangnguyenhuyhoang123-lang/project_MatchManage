import { useState } from "react";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({ username: "", email: "" });

    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/user-account/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
            userName: userName,
            password: password,
            displayName: fullName,
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

      alert("Đăng ký thành công");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>

            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {errors.username && (
              <p className="absolute text-red-500 text-sm mt-1">
                {errors.username}
              </p>
            )}
            {/* {errors.username && (
              <p className="text-red-500 text-sm mt-0.2">{errors.username}</p>
            )} */}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="absolute text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-gray-500"
              ></button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" />
            <span>
              I agree to the{" "}
              <a href="#" className="text-green-600 hover:underline">
                Terms & Conditions
              </a>
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 hover:shadow-md transition"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-400">or</div>

        {/* Google */}
        <button className="w-full border py-2 rounded-lg hover:bg-gray-100 transition">
          Sign up with Google
        </button>

        {/* Login link */}
        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
