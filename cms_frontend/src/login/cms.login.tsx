import React from "react";
import { MdLockOutline, MdOutlineMailOutline } from "react-icons/md";
import { Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-1/4 max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-3xl font-bold">Log In</h2>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MdOutlineMailOutline />
              </span>
              <input
                type="email"
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
                className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Password"
                required
              />
            </div>
          </div>

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
            <Link to="/template">
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#39AF9F] border border-transparent rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Sign In
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
