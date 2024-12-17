import { useEffect, useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import Bear4 from "../assets/Bear4.png";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { UserButton } from "@clerk/clerk-react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import firebaseConfig2 from "../../resources/firebase2.js"; 
import { useParams, useNavigate } from "react-router-dom";
import { Activity, activities } from "../activityData";

interface ActivitiesProps {
  activities: Activity[];
}

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

/**
 * This method creates a .ics file download so the user can
 * add the event to their calendar.
 */
const createICSFile = (activity: Activity) => {
  const startDateTime = new Date(
    `${activity.date}T${convertTo24Hour(activity.startTime)}`
  ).toISOString();
  const endDateTime = new Date(
    new Date(startDateTime).getTime() + 60 * 60 * 1000
  ).toISOString();

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${activity.title}`,
    `DESCRIPTION:${activity.description}`,
    `LOCATION:${activity.location}`,
    `DTSTART:${startDateTime.replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTEND:${endDateTime.replace(/[-:]/g, "").split(".")[0]}Z`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${activity.title}.ics`;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * This method converts the time string to a more readable format.
 */
const convertTo24Hour = (time: string) => {
  const [hourMin, period] = time.split(" ");
  let [hour, minutes] = hourMin.split(":").map(Number);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

export default function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "activities"));
        const activityData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((item) => item.id === id) as Activity | undefined;

        if (activityData) {
          setActivity(activityData);
          // debugging
          console.log("printing activity" + activityData)
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      } 
    };

    fetchActivity();
  }, [id]);

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-customBrown text-white">
        <h1 className="paytone-one text-4xl">Activity Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl mt-4"
        >
          Back to Main
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customBrown text-white p-6">
      <div className="flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl"
        >
          Back to Main
        </button>
      </div>
      <div
        key={activity.id}
        className="border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-auto h-auto text-center space-y-2"
      >
        <div className="flex flex-row items-start mt-6 gap-6">
          <img
            src={activity.image}
            alt={activity.title}
            className="w-1/2 max-w-lg h-auto object-cover rounded-lg"
          />
          <div className="flex flex-col justify-start w-1/2">
            <h1 className="paytone-one text-4xl mb-4 text-customRed">
              {activity.title}
            </h1>
            <p className="kadwa text-lg mb-6 text-black">
              {activity.description}
            </p>
            <div className="kadwa text-lg space-y-4 text-black">
              <p>
                <strong>Date:</strong> {activity.date}
              </p>
              <p>
                <strong>Time:</strong> {activity.startTime}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {typeof activity.location === "string"
                  ? activity.location
                  : activity.location.name}
              </p>
              <p>
                <strong>Attendees:</strong> {activity.attendees?.length || 0}
              </p>
            </div>
            <div className="flex flex-row space-x-4 mt-6">
              <button
                className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border text-black border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => createICSFile(activity)}
              >
                Add to Calendar
              </button>
              <button
                className="kadwa rounded-full px-4 py-3 text-sm border text-black border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => alert(`${activity.title} added to favorites!`)}
              >
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
