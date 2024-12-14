import { useState } from "react";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';
import DropDown from '../assets/FilterDropDown.png'; 
import Pin from '../assets/BrownPin.png'; 
import Calendar from '../assets/CalendarIcon.png'; 
import { useNavigate } from "react-router-dom";
import Footer from "./Footer"; 
import {db} from "./Activities"; 
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

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

      <div className="absolute top-[84px] left-1/2 transform -translate-x-1/2 bg-white rounded-full flex items-center justify-between px-2 py-2 md:px-2 md:py-2 w-2/3 lg:w-1/2 z-10 space-x-4">
        <div className="flex flex-row">
          <img
            src={Pin}
            alt="A bear"
            className="w-8 h-auto space-x-2"
          />
          <div className="flex-grow text-center kadwa text-customBrown text-md md:text-xl">
            Location
          </div> 
        </div>
        <div className="flex-grow text-center kadwa text-customBrown text-md md:text-xl">
          Date
        </div>
        <div>
          <select className="flex-grow text-center kadwa text-customBrown text-xl md:text-xl">
            Add Filters
          </select>
        </div>
        <input placeholder="Enter Keyword" className="kadwa items-center justify-center text-xs bg-zinc-300 rounded-lg w-24 h-8"></input>
        <button onClick={handleSearchClick} className="paytone-one bg-customRed text-white rounded-full text-md px-2 py-1 md:px-4 md:py-2 md:text-xl">SEARCH</button>
      </div>

      <div className="px-8 py-12 bg-customLightBrown rounded-t-3xl">
        <h1 className="kadwa text-customBrown text-3xl font-bold text-left mt-16 mb-10 ml-16">
          Featured Activities
        </h1>
        <div className="flex flex-row md:flex-row items-center justify-center space-y-0 md:space-y-0 space-x-4 md:space-x-10">
          {/*  items-center justify-center space-y-10 md:space-y-10 md:space-x-10 */}
          <div className="bg-white rounded-2xl p-4 w-80 h-130 text-center space-y-2">
            Test1
          </div>
          <div className="bg-white rounded-2xl p-4 w-80 h-130 text-center space-y-2">
            Test2
          </div>
          <div className="bg-white rounded-2xl p-4 w-80 h-130 text-center space-y-2">
            Test
          </div>
          <div className="bg-white rounded-2xl p-4 w-80 h-130 text-center space-y-2">
            Test
          </div>
        </div>
      </div>
    </div>
  );
}
