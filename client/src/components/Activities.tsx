import { useEffect, useState } from "react";
import '../output.css';
import '../styles/App.css';
import '../styles/index.css';
import { db } from "./App";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { activities, Activity } from "../activityData";
import { useNavigate } from "react-router-dom";

// hii I moved the mock data to a new file to keep things more organized
// as I will be adding more data (check out activitiyData.ts in src)


/**
 * This method creates a .ics file download so the user can 
 * add the event to their calendar.
 */
const createICSFile = (activity: Activity) => {
  const startDateTime = new Date(`${activity.date}T${convertTo24Hour(activity.time)}`).toISOString();
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

  return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
};

/**
 * This function pushes a list of prepopulated event data to the firebase.
 * It goes through the list, looks at the event IDs, and only pushes
 * IDs that are new so there aren't duplicate events.
 */
const pushToFirestore = async () => {
  const activitiesCollection = collection(db, "activities");
  try {
    const existingActivitiesSnapshot = await getDocs(activitiesCollection);

    const existingActivityIds = new Set(
      existingActivitiesSnapshot.docs.map((doc) => doc.data().id)
    );

    for (const activity of activities) {
      if (!existingActivityIds.has(activity.id)) {
        await addDoc(activitiesCollection, activity);
        console.log(`Activity with ID ${activity.id} added to Firestore.`);
      } else {
        console.log(`Activity with ID ${activity.id} already exists.`);
      }
    }

    // alert("Activities processed successfully!");
  } catch (error) {
    console.error("Error uploading activities:", error);
    // alert("Failed to upload activities.");
  }
};

export default function Activities() {
  useEffect(() => {
    pushToFirestore();
  }, []);

  const navigate = useNavigate();

  return (
    
      <div className="flex flex-row items-center justify-center flex-wrap gap-8 space-x-5 md:space-x-8">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-96 h-130 text-center space-y-2"
            onClick={() => navigate(`/activity/${activity.id}`)}
          >
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h2 className="paytone-one text-customRed text-left">
              {activity.title}
            </h2>
            <p className="kadwa text-xs text-left">{activity.description}</p>
            <div className="kadwa flex flex-row text-s text-left space-x-3">
              <div className="flex flex-col">
                <p>
                  <strong>Date:</strong> {activity.date}
                </p>
                <p>
                  <strong>Time:</strong> {activity.time}
                </p>
              </div>
              <p>
                <strong>Location:</strong> {activity.location}
              </p>
            </div>
            <p className="kadwa text-xs">{activity.attendees} Attending</p>
            <button
              className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => createICSFile(activity)}
            >
              Add to Calendar
            </button>
            <div style={{ margin: "1rem 0" }}>
              <label>
                <input type="checkbox" /> Going
              </label>
            </div>
            <button
              className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => alert(`Added ${activity.title} to your calendar!`)}
            >
              Add to Favorites
            </button>
          </div>
        ))}
      </div>
  );
}
