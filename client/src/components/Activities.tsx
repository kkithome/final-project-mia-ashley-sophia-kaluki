import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import '../output.css';
import '../styles/App.css';
import '../styles/index.css';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { activities as fileActivities, Activity } from "../activityData";
import firebaseConfig2 from '../../resources/firebase2.js'; 
import { useParams, useNavigate } from "react-router-dom";

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

export {db}; 

/**
 * This method creates a .ics file download so the user can 
 * add the event to their calendar.
 */
const createICSFile = (activity: Activity) => {
  const startDateTime = new Date(`${activity.date}T${convertTo24Hour(activity.startTime)}`).toISOString();
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

export default function Activities({ activities }: ActivitiesProps) {
  const [activities2, setActivities] = useState<Activity[]>([]); 
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const userId = "user-id-placeholder";

  useEffect(() => {
    setActivities(activities);
  }, [activities]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favoritesRef = doc(db, "favorites", userId);
        const docSnapshot = await getDoc(favoritesRef);
        if (docSnapshot.exists()) {
          setFavorites(docSnapshot.data().activityIds || []);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (activityId: number) => {
    const activityIdStr = activityId.toString();
    console.log("Toggling favorite for activity:", activityIdStr);
  
    try {
      const favoritesRef = doc(db, "favorites", userId);
      const docSnapshot = await getDoc(favoritesRef);
  
      if (!docSnapshot.exists()) {
        console.log("Favorites document does not exist. Creating a new one...");
        await setDoc(favoritesRef, { activityIds: [] });
      }
  
      const isFavorite = favorites.includes(activityIdStr);
  
      if (isFavorite) {
        console.log("Removing from favorites");
        await updateDoc(favoritesRef, {
          activityIds: arrayRemove(activityIdStr),
        });
        setFavorites((prev) => prev.filter((id) => id !== activityIdStr));
      } else {
        console.log("Adding to favorites");
        await updateDoc(favoritesRef, {
          activityIds: arrayUnion(activityIdStr),
        });
        setFavorites((prev) => [...prev, activityIdStr]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };
  
  
  // /**
  //  * Retrieves the activities from the firebase
  //  */
  // const getActivities = async () => {
  //   const collection2 = collection(db, "activities"); 
  //   try {
  //     const existingActivitiesSnapshot = await getDocs(collection2);
  //     console.log(existingActivitiesSnapshot); 
  //     const fetchedActivities: Activity[] = existingActivitiesSnapshot.docs.map((doc) => ({
  //       id: doc.data().id,
  //       title: doc.data().title,
  //       description: doc.data().description,
  //       date: doc.data().date,
  //       startTime: doc.data().startTime,
  //       endTime: doc.data().endTime,
  //       image: doc.data().image,
  //       location: doc.data().location,
  //       attendance: doc.data().attendance,
  //       attendees: doc.data().attendees,
  //       time: doc.data().time,
  //       category: doc.data().category,
  //       onCampus: doc.data().onCampus,
  //     }));
  //     setActivities(fetchedActivities); 
  //     console.log(fetchedActivities); 
  //   }
  //   catch (error) {
  //     console.error("Error fetching activities:", error);
  //   }
  // };

  // /**
  //  * This function pushes a list of prepopulated event data to the firebase.
  //  * It goes through the list, looks at the event IDs, and only pushes
  //  * IDs that are new so there aren't duplicate events.
  //  */
  // const pushToFirestore = async () => {
  //   const activitiesCollection = collection(db, "activities");
  //   try {
  //     // Get existing activities in Firestore
  //     const existingActivitiesSnapshot = await getDocs(activitiesCollection);
  //     const existingActivityIds = new Set(
  //       existingActivitiesSnapshot.docs.map((doc) => doc.data().id)
  //     );

  //     // Push missing activities from the file
  //     for (const activity of fileActivities) {
  //       if (!existingActivityIds.has(activity.id)) {
  //         await addDoc(activitiesCollection, activity);
  //         console.log(`Activity with ID ${activity.id} added to Firestore.`);
  //       } else {
  //         console.log(`Activity with ID ${activity.id} already exists.`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error uploading activities:", error);
  //   }
  // };

  useEffect(() => {
    if (activities && activities.length > 0) {
      setActivities(activities);
    } else {
      const fetchActivities = async () => {
        const collectionRef = collection(db, "activities");
        try {
          const existingActivitiesSnapshot = await getDocs(collectionRef);
          const fetchedActivities: Activity[] = existingActivitiesSnapshot.docs.map((doc) => ({
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
          setActivities(fetchedActivities);
        } catch (error) {
          console.error("Error fetching activities:", error);
        }
      };
      fetchActivities();
    }
  }, [activities]);

  return (
    <div className="flex flex-row items-center justify-center flex-wrap gap-8 space-x-5 md:space-x-8">
      {activities2.map((activity) => (
        <div
          key={activity.id}
          className="border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-96 h-130 text-center space-y-2"
        >
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full h-40 object-cover rounded-lg"
          />
          <h2
            className="paytone-one text-customRed text-left cursor-pointer"
            onClick={() => navigate(`/activity/${activity.id}`)}
          >
            {activity.title}
          </h2>
          <p className="kadwa text-xs text-left">{activity.description}</p>
          <div className="kadwa flex justify-between flex-row text-s text-left space-x-3">
            <div className="flex flex-col">
              <p>
                <strong>Date:</strong> {activity.date}
              </p>
              <p>
                <strong>Time:</strong> {activity.startTime}
              </p>
            </div>
            <p className="kadwa text-xs">{activity.attendees.length} Attending</p>
            </div>
            <div className = "flex flex-row gap-4">
            <button
              className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => createICSFile(activity)}
            >
              Add to Calendar
            </button>
            <div className = "kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border border-black bg-gray-100 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-black">
              <label>
                <input type="checkbox" /> Going
              </label>
            </div>
            {/* <button
              className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => alert(`Added ${activity.title} to your calendar!`)}
            >
              Add to Favorites
            </button> */}
            <button
              className={`kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border ${
                favorites.includes(activity.id.toString()) ? "bg-red-500 text-white" : "bg-gray-100"
              } hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-black`}
              onClick={() => toggleFavorite(activity.id)}
            >
              {favorites.includes(activity.id.toString()) ? "Remove from Favorites" : "Add to Favorites"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

}
