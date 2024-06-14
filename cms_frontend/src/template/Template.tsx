import React from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link } from "react-router-dom";

interface Props {
  // Define your props here
}

const Template: React.FC<Props> = (
  {
    /* Destructure props here */
  }
) => {
  return (
    <>
      <div className="bg-[#39AF9F]">
        <div className="container mx-auto py-8">
          <p className="text-white text-2xl text-center">
            Template management system
          </p>
        </div>
      </div>
      <div className="h-80 flex flex-col justify-center items-center">
        <Link to="/create-template">
          <button className="flex items-center rounded-full bg-[#39AF9F] hover:bg-teal-600 text-white py-3 px-6 focus:outline-none transition duration-300 ease-in-out">
            <span className="mr-2 text-xl ">Create a new template</span>
            <BiAddToQueue size={30} className="animate-pulse" />{" "}
          </button>
        </Link>
      </div>
    </>
  );
};

export default Template;
