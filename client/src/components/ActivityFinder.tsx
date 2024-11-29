import { useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";

// Define an enum for sections, making it easy to refer to different sections by name
enum Section {
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function ActivitiesFinder() {
  return (
    <div>
      <h1 aria-label="Page Title">Activity Finder</h1>
      <div style={{ display: "1000px", gap: "2rem", flexDirection: "column" }}>
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
