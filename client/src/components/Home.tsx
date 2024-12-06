import { useState } from "react";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';
import { useNavigate } from "react-router-dom";
import Footer from "./Footer"; 

export default function Home() {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/activity-finder"); 
  };

  return (
    <div className="space-y-32 relative">
      <div className="flex flex-row items-end justify-center">
        <img
          src={Bear4}
          alt="A bear"
          className="w-12 md:w-32 h-auto overflow-hidden relative"
        />
        <p
          className="limelight text-3xl md:text-7xl text-center text-white"
          aria-label="Page Title"
        >
          Bear Tracks
        </p>
      </div>

      <div className="absolute top-[84px] left-1/2 transform -translate-x-1/2 bg-white rounded-full flex items-center justify-between px-2 py-2 md:px-2 md:py-2 w-2/3 lg:w-1/2 z-10">
        <div className="flex-grow text-center kadwa text-customBrown text-md md:text-xl">
          Location
        </div>
        <div className="flex-grow text-center kadwa text-customBrown text-md md:text-xl">
          Date
        </div>
        <div className="flex-grow text-center kadwa text-customBrown text-md md:text-xl">
          Add Filters
        </div>
        <button onClick={handleSearchClick}
            className="paytone-one bg-customRed text-white rounded-full text-md px-2 py-1 md:px-4 md:py-2 md:text-xl"
          >SEARCH</button>
      </div>

      <div className="px-8 py-12 bg-customLightBrown rounded-t-3xl">
        <h1 className="kadwa text-customBrown text-3xl font-bold text-left mt-16 mb-10 ml-16">
          Featured Activities
        </h1>
        {/* <FeaturedActivities /> */}
      </div>
    </div>
  );
}
