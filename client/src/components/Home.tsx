import { useState } from "react";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/activity-finder"); 
  };

  return (
    <div className="space-y-10">
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
        <button onClick={handleSearchClick}
          className="kadwa bg-customRed text-white rounded-lg text-md px-3 py-1 md:px-7 md:py-2 md:text-xl"
        >Search</button>
      </div>
    </div>
  );
}
