import { useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';

// Define an enum for sections, making it easy to refer to different sections by name
enum Section {
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function ActivitiesFinder() {
  return (
    <div>
      <p className="header-text text-3xl md:text-7xl !important text-center text-white" aria-label="Page Title">Activity Finder</p>
      <div className="flex flex-col gap-8">
        <section>
          <Activities />
        </section>
        <section>
          <h2>Map</h2>
          <Mapbox />
        </section>
      </div>
    </div>
  );
}
