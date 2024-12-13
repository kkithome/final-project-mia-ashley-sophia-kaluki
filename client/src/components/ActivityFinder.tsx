import { useState, useEffect } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import '../styles/App.css';
import '../styles/index.css';
import '../output.css';
import Bear4 from '../assets/Bear4.png';
import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {db} from "./Activities"; 
import { Activity } from "../activityData";
import { collection, query, where, getDocs } from "firebase/firestore"; 

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
      }   
      else {
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
      <div className="flex flex-row">
        <input
          // value={searchInput || ""}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Enter area search term"
          aria-description="Enter the keyword you would like to search the area descriptions for"
          type="text"
          placeholder="Search Keyword"
        ></input>
        <div>
        <input
          type="checkbox"
          id="onCampusCheckbox"
          onChange={(e) => setIsOnCampusState(e.target.checked ? true : null)}
        />
        <label htmlFor="onCampusCheckbox" className="ml-2">
          On Campus
        </label>
      </div>
        <input
          type="date"
          onChange={(e) => setStartDateState(e.target.value || null)}
        />
        <input
          type="date"
          onChange={(e) => setEndDateState(e.target.value || null)}
        />
        <select onChange={(e) => setCategoryState(e.target.value || null)}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Workshop">Workshop</option>
        </select>
        <button
          onClick={() => {
            console.log("Keyword:", searchInput);

            const filters = {
              isOnCampus: isOnCampusState || null, 
              startDate: startDateState || null,   
              endDate: endDateState || null,      
              category: categoryState || null,
            };
            
            searchActivities(searchInput || "", filters);
          }}
        >
          Enter Search
        </button>
      </div>
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
        <Activities activities={searchResults}/>
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
