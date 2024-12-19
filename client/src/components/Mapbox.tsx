import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import { useUser,
} from "@clerk/clerk-react";
import { getPins } from "../utils/api";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import firebaseConfig2 from "../../resources/firebase2.js"; 
import Map, {
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
  Marker,
} from "react-map-gl";
import { initializeApp, getApp } from "firebase/app";
import { addDoc, getFirestore } from "firebase/firestore";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

let app;
if (!app) {
  console.log("Database initialized");
  app = initializeApp(firebaseConfig2, "activities");
} else {
  app = getApp();
  console.log("App already created");
}
const db = getFirestore(app);

export { db }; 

// API key for Mapbox, read from environment variables
const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

// API key for Mapbox, read from environment variables
export interface LatLong {
  lat: number;
  long: number;
}

// Coordinates for Providence, Rhode Island
const ProvidenceLatLong: LatLong = {
  lat: 41.825743,
  long: -71.406371,
};

// Set the initial zoom level for the map
const initialZoom = 16;

// Main Mapbox component
export default function Mapbox() {
  const mapRef = useRef<mapboxgl.Map | null>(null); // Ref to store the Mapbox instance
  const { user } = useUser(); // hook

  if (!user) {
    return <div>Loading...</div>;
  }

  const USER_ID = user.id;

  // Set the initial view state for the map (centered on Providence, RI)
  const [viewState, setViewState] = useState({
    longitude: ProvidenceLatLong.long,
    latitude: ProvidenceLatLong.lat,
    zoom: initialZoom,
  });

  // variable for pins
  const [pins, setPins] = useState<LatLong[]>([]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const collection1 = collection(db, "activities");
        const existingActivitiesSnapshot = await getDocs(collection1);
        const fetchedPins = existingActivitiesSnapshot.docs
          .map((doc) => {
            const location = doc.data().location; 
            const event = doc.data()
            console.log(event)
            // debugging print
            console.log("Processing location:", location);
            console.log("Processing lat:", location.latitude);

            if (location?.latitude && location?.longitude) {
              return {
                lat: parseFloat(location.latitude),
                long: parseFloat(location.longitude),
              };
            }
            return null; 
          })
          .filter((pin): pin is LatLong => pin !== null);

        setPins(fetchedPins);
        console.log(fetchedPins)

      } catch (error) {
        console.error("Error fetching pins:", error);
      }
    };
    fetchPins();
  }, [USER_ID]);

  // useEffect(() => {
  //   const initializePins = async () => {
  //     await fetchPins();
  //   };
  //   initializePins();
  // }, []);

  return (
    <div className="w-full">
      <div className="w-10/12 mx-auto h-[800px] rounded-lg relative mb-8">
        <Map
          mapboxAccessToken={MAPBOX_API_KEY}
          {...viewState}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "20px",
          }}
          mapStyle={"mapbox://styles/mapbox/streets-v12"}
          onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
        >
          {pins.map((pin, index) => (
            <Marker key={index} latitude={pin.lat} longitude={pin.long}>
              <img
                src="/src/assets/BrownPin.png" 
                style={{
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                }}
                alt="map marker"
              />
            </Marker>
          ))}
          <div style={{ position: "absolute", top: 15, right: 15, zIndex: 1 }}>
          </div>
        </Map>
      </div>
    </div>
  );
}
