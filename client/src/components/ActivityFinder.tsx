import { useState, useEffect } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import Bear4 from "../assets/Bear4.png";
import { UserButton } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "./Activities";
import { Activity } from "../activityData";
import { collection, query, where, getDocs } from "firebase/firestore";
import Bear2 from "../assets/Bear2.png"; 

enum Section {
  MAP_DEMO = "MAP_DEMO",
  ACTIVITIES = "ACTIVITIES",
}

export default function ActivitiesFinder() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSearchResults = location.state?.searchResults || [];
  const [searchResults, setSearchResults] = useState(initialSearchResults);

  useEffect(() => {
    if (!location.state?.searchResults) {
      console.warn("No search results passed. Falling back to default activities.");
    }
  }, [location.state]);

  return (
    <div className="space-y-10">
      <div className="flex flex-row item-center justify-center w-full mt-3">
        <a
          href="/searcher"
          className="paytone-one bg-customRed text-white rounded-lg text-3xl px-7 py-1 md:px-6 md:py-2 md:text-5xl mt-8 ml-12"
        >
          Search
        </a>
        <button
          className="paytone-one bg-customRed text-white rounded-lg text-3xl px-7 py-1 md:px-6 md:py-2 md:text-5xl mt-8 ml-12 mr-4"
          onClick={() => navigate("/user-profile")}
        >
          User Profile
        </button>
      </div>
      <div className="flex flex-col space-x-10">
        <Activities activities={searchResults} />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-end justify-between">
          <div className="basis-1/4"></div>
          <div className="basis-1/2">
            <h3
              className="limelight text-3xl md:text-7xl text-white"
              aria-label="Page Title"
            >
              Map
            </h3>
          </div>
          <div className="basis-1/4 flex flex-row justify-items-end">
            <img
              src={Bear2}
              alt="A bear"
              className="w-32 md:w-32 h-auto overflow-hidden relative"
            />
          </div>
        </div>
        <Mapbox />
      </div>
    </div>
  );
}
