import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./logo192.png";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Alert } from "@nextui-org/react";

function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false); // Error state for NextUI Alert
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_DASH_KEY; // Access the correct password

    if (password === correctPassword) {
      setError(false); // Clear error state

      // Log the current date to local storage
      const currentDate = new Date().toLocaleString();
      localStorage.setItem("timoti", currentDate);

      // Navigate to the dashboard
      navigate("/dashboard");
    } else {
      setError(true); // Trigger error alert
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800">
      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-3xl bg-gray-800/20 backdrop-blur-2xl p-10 shadow-2xl border border-gray-700/30 relative overflow-hidden">
        {/* Neon Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl animate-pulse"></div>

        {/* Logo and Heading */}
        <div className="text-center relative z-10">
          <img
            src={Logo}
            alt="DynamoChart Logo"
            className="mx-auto h-28 w-28 mb-6 animate-float"
          />
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            color="error"
            description="Incorrect password. Please try again."
            isDismissable
            onDismiss={() => setError(false)}
            className="mb-6 relative z-10"
          />
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-2xl bg-gray-700/50 border border-gray-600/30 px-4 py-3 text-sm text-gray-100 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400 hover:text-indigo-500 transition-colors"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            Sign In
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-gray-400">
          DynamoChart UG

          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;