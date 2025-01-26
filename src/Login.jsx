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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-[450px] space-y-8 rounded-lg border border-gray-700 bg-zinc-900 p-8 shadow-lg">
        <div className="text-center">
          <img src={Logo} alt="DynamoChart Logo" className="mx-auto h-20 mb-3" />
          <h2 className="text-2xl font-bold text-gray-200">Sign in to DynamoChart</h2>
          <p className="text-sm text-gray-400">Enter your password to access the dashboard</p>
        </div>

        {error && (
          <Alert
            color="danger"
            description="Incorrect password. Please try again."
            isDismissable
            onDismiss={() => setError(false)}
          />
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-lg border border-gray-600 bg-zinc-800 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400 hover:text-indigo-500"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
