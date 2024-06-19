import axios from "axios";
import React, { useState } from "react";
import { MdLockOutline, MdPersonOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [user_name, setUser_name] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}user/login`,
        {
          user_name,
          password,
        },
        {
          withCredentials: true, // Send cookies with the request
        }
      );

      console.log("Login response:", response);

      if (response.status === 200) {
        // Redirect to the template page upon successful login
        navigate("/template");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-1/4 max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-3xl font-bold">Log In</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MdPersonOutline />
              </span>
              <input
                type="user_name"
                value={user_name}
                onChange={(e) => setUser_name(e.target.value)}
                className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Input Email Address"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MdLockOutline />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Password"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label
                htmlFor="remember-me"
                className="block ml-2 text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Lost password?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#39AF9F] border border-transparent rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
