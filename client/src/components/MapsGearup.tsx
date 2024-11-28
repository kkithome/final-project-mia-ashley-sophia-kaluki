import { useState } from "react";
import FirestoreDemo from "./FirestoreDemo";
import Mapbox from "./Mapbox";
import Activities from "./Activities";

// Define an enum for sections, making it easy to refer to different sections by name
enum Section {
  FIRESTORE_DEMO = "FIRESTORE_DEMO",
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function MapsGearup() {
  const [section, setSection] = useState<Section>(Section.MAP_DEMO);

  return (
    <div>
      <h1 aria-label="Page Title">Maps</h1>
      {/* <button onClick={() => setSection(Section.FIRESTORE_DEMO)}>
        Section 1: Firestore Demo
      </button> */}
      {/* <button onClick={() => setSection(Section.MAP_DEMO)}>
        Mapbox
      </button> */}
      {/* {section === Section.FIRESTORE_DEMO ? <FirestoreDemo /> : null} */}
      {/* {section === Section.MAP_DEMO ? <Mapbox/> : null} */}
      <nav>
        <button onClick={() => setSection(Section.MAP_DEMO)}>Map</button>
        <button onClick={() => setSection(Section.ACTIVITIES)}>
          Activities
        </button>
      </nav>

      {section === Section.MAP_DEMO && <Mapbox />}
      {section === Section.ACTIVITIES && <Activities />}
    </div>
  );
}
