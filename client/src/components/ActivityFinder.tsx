import { useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';
import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

enum Section {
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function ActivitiesFinder() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <div className="flex w-full justify-end p-4">
      <div>
        <button
          className="paytone-one bg-customRed text-white rounded-lg flex items-center justify-center text-md px-2 py-1 md:px-4 md:py-2 md:text-xl"
          onClick={() => navigate("/user-profile")}
        >
          User Profile
        </button>
      </div>
      </div>
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
      <div className="flex flex-col space-x-10">
        <Activities />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3
          className="limelight text-3xl md:text-7xl text-white"
          aria-label="Page Title"
        >
          Map
        </h3>
        <Mapbox />
      </div>
    </div>
  );
}
