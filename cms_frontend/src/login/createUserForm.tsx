import React, { useState } from "react";
import { createUser } from "../api/auth.api";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

interface CreateUserProps {
  onClose: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await createUser(username, password);
      setSuccess("User created successfully");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create New User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Username
          </label>
          <div className="flex items-center">
            <FaUser className="absolute left-3 text-gray-400" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter your username"
            />
          </div>
        </div>
        <div className="relative">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Password
          </label>
          <div className="flex items-center">
            <FaLock className="absolute left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
