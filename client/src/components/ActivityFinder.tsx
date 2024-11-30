import { useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';

// Define an enum for sections, making it easy to refer to different sections by name
enum Section {
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function ActivitiesFinder() {
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
          Activity Finder
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
