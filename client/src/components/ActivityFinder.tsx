import { useState, useEffect } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import Bear4 from "../assets/Bear4.png";
import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
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
  const [searchResults, setSearchResults] = useState<Activity[]>([]);
  const [searchInput, setSearchTerm] = useState<any>(null);

  // useEffect(() => {
  //   setActivities(searchResults);
  // }, [searchResults]);

  const searchActivities = async (keyword: string = "", filters: any = {}) => {
    let { isOnCampus, startDate, endDate, startTime, category } = filters;
    const searchCollection = collection(db, "activities");

    if (!startDate) {
      const today = new Date().toISOString().split("T")[0];
      startDate = today;
      console.log(today);
    }

    console.log(startDate);
    console.log(category);
    try {
      let baseQuery = query(searchCollection, where("date", ">=", startDate));
      console.log("Base query after startDate:", baseQuery);

      // if (endDate) {
      //   baseQuery = query(baseQuery, where("date", "<=", endDate));
      // }

      // if (isOnCampus !== undefined) {
      //   const locationFilter = isOnCampus ? "on-campus" : "off-campus";
      //   baseQuery = query(baseQuery, where("location", "==", locationFilter));
      // }

      if (category) {
        baseQuery = query(baseQuery, where("category", "==", category));
      }

      const querySnapshot = await getDocs(baseQuery);
      let fetchedActivities: Activity[] = querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        title: doc.data().title,
        description: doc.data().description,
        date: doc.data().date,
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
        image: doc.data().image,
        location: doc.data().location,
        attendance: doc.data().attendance,
        attendees: doc.data().attendees,
        time: doc.data().time,
        category: doc.data().category,
        onCampus: doc.data().onCampus,
      }));

      console.log(`fetched activities: ${fetchedActivities}`);

      if (keyword) {
        console.log("Filtering activities by keyword:", keyword);
        console.log(`fetched activities: ${fetchedActivities}`);

        fetchedActivities = fetchedActivities.filter(
          (activity) =>
            activity.title.toLowerCase().includes(keyword.toLowerCase()) ||
            activity.description.toLowerCase().includes(keyword.toLowerCase())
        );

        if (fetchedActivities.length > 0) {
          setSearchResults(fetchedActivities);
        } else {
          console.log("No activities match the keyword");
        }
      } else {
        setSearchResults(fetchedActivities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const [isOnCampusState, setIsOnCampusState] = useState<boolean | null>(null);
  let [startDateState, setStartDateState] = useState<string | null>(null);
  const [endDateState, setEndDateState] = useState<string | null>(null);
  const [categoryState, setCategoryState] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <div className="flex flex-row item-center justify-center w-full mt-3">
      <a
        href="/searcher"
        className="paytone-one bg-customRed text-white rounded-lg text-3xl px-7 py-1 md:px-6 md:py-2 md:text-5xl mt-8 ml-12"
      >
        Search
      </a>
      </div>
      <div className="flex flex-col space-x-10">
        <Activities activities={searchResults} />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-end justify-between">
        <div className = "basis-1/4">
                </div>
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
