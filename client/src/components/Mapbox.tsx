import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import { useUser,
} from "@clerk/clerk-react";
import { addPin, clearUser, getPins } from "../utils/api";

// Import Mapbox components from react-map-gl library
import Map, {
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
  Marker,
} from "react-map-gl";
import { geoLayer, overlayData } from "../utils/overlay";

import { initializeApp } from "firebase/app";
import { addDoc, getFirestore } from "firebase/firestore";
import { collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCggcN4WSOUb6MsVEPsxpEG_4MFpnW0hyw",
  authDomain: "maps-hgnguyen.firebaseapp.com",
  projectId: "maps-hgnguyen",
  storageBucket: "maps-hgnguyen.firebasestorage.app",
  messagingSenderId: "364594908351",
  appId: "1:364594908351:web:812fd2cc0f3a97b9318a0a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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

  // load pins
  useEffect(() => {
    getPins(user.id).then((data) => {
      setPins(
        data.pins.map((str: string) => {
          const parts = str.split(":");
          return { lat: parseFloat(parts[0]), long: parseFloat(parts[1]) };
        })
      );
    });
  }, [user.id]);

  const [overlay, setOverlay] = useState<GeoJSON.FeatureCollection | undefined>(
    undefined
  );

  // Add pins to pins variable and load to firebase
  function onMapClick(e: MapLayerMouseEvent) {
    console.log(e.lngLat.lat);
    console.log(e.lngLat.lng);
    const latLng: LatLong = {
      lat: e.lngLat.lat,
      long: e.lngLat.lng,
    };
    setPins([...pins, latLng]);
    if (user) {
      addPin(user.id, latLng);
    } else {
      console.warn("User is not logged in, cannot add pin.");
    }
  }

  useEffect(() => {
    overlayData("").then((response: GeoJSON.FeatureCollection | undefined) => {
      setOverlay(response);
      console.log(response);
    });
  }, []);

  // state variable for the query
  const [query, setQuery] = useState<string>("");

  function handleSearch() {
    overlayData(query).then(
      (response: GeoJSON.FeatureCollection | undefined) => {
        if (response) {
          // Add a custom property to highlight specific areas
          const highlightedOverlay = {
            ...response,
            features: response.features.map((feature) => {
              const isHighlighted = feature.properties?.highlight === "true"; // Adjust based on your backend response
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  isHighlighted, // Add a flag for highlighting
                },
              };
            }),
          };

          setOverlay(highlightedOverlay);
          console.log("Highlighted Overlay:", highlightedOverlay);
        }
      }
    );

    console.log("Search Query:", query);
    setQuery("");
  }

  useEffect(() => {
    if (overlay && mapRef.current) {
      const mapInstance = mapRef.current;
      overlay.features.forEach((feature) => {
        const isHighlighted = feature.properties?.isHighlighted;

        mapInstance.addLayer({
          id: `layer-${feature.id}`,
          type: "fill",
          source: {
            type: "geojson",
            data: overlay, // GeoJSON data
          },
          paint: {
            "fill-color": isHighlighted ? "#FF5733" : "#cccccc", // Highlighted areas in orange
            "fill-opacity": isHighlighted ? 0.8 : 0.5,
          },
        });
      });
    }
  }, [overlay]);

  // use effect to search by pressing enter
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === "Enter") {
        handleSearch();
        console.log("enter pressed");
      }
    }
    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [query, handleSearch]);

  return (
    <div className="map">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter a Keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "400px" }}
        />
        <button onClick={handleSearch}>Enter</button>
      </div>
      <Map
        mapboxAccessToken={MAPBOX_API_KEY}
        {...viewState}
        style={{ width: window.innerWidth, height: window.innerHeight }}
        mapStyle={"mapbox://styles/mapbox/streets-v12"}
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
        onClick={(ev: MapLayerMouseEvent) => onMapClick(ev)}
      >
        {pins.map((pin) => (
          <Marker // add a marker for every pin in the pins variable
            latitude={pin.lat}
            longitude={pin.long}
          >
            <img
              src="/src/components/map-marker.png"
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
          <button
            onClick={async () => {
              // a button to clear pins, also clear data from firebase
              setPins([]);
              await clearUser(user.id);
            }}
          >
            Clear My Pins
          </button>
        </div>
        <Source id="geo_data" type="geojson" data={overlay}>
          <Layer {...geoLayer} />
        </Source>
      </Map>
    </div>
  );
}
