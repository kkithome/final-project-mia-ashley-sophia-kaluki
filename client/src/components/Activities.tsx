import { useEffect, useState } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import "../output.css";
import "../styles/App.css";
import "../styles/index.css";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { activities as fileActivities, Activity } from "../activityData";
import firebaseConfig2 from "../../resources/firebase2.js";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, hasImage, imageUrl, fullName } from "@clerk/clerk-react";
import CalendarIcon from "../assets/CalendarIcon.png";
import UnfilledHeart from "../assets/UnfilledHeart.png";
import FilledHeart from "../assets/FilledHeart.png";
import CheckBox from "../assets/CheckBox.png";
import UnfilledCheckBox from "../assets/UnfilledCheckBox.png";
import RedPin from "../assets/RedPin.png";
import ForwardArrow from "../assets/ForwardArrow.png";
import BackArrow from "../assets/BackArrow.png";

interface ActivitiesProps {
  activities: Activity[];
}

/** Initializing the firestore database if it doesn't already exist */
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

/** Creates a calendar download file based on the event information */
const createICSFile = (activity: Activity) => {
  let dtstart = "";
  let dtend = "";
  let rrule = "";

  // if (activity.date.toLowerCase().includes("every")) {
  //   rrule = "FREQ=DAILY";
  // } else if (activity.date.toLowerCase().includes("-")) {
  //   rrule = "FREQ=WEEKLY;BYDAY=" + activity.date.split("-").map((day) => day.trim().toUpperCase().slice(0, 2)).join(",");
  // } else {
  //   try {
  //     const dateObj = new Date(activity.date);
  //     if (!isNaN(dateObj.getTime())) {
  //       dtstart = dateObj.toISOString().split("T")[0].replace(/-/g, "");
  //     } else {
  //       console.error("Invalid date format:", activity.date);
  //     }
  //   } catch {
  //     console.error("Invalid date format:", activity.date);
  //   }
  // }

  // const startTime = convertTo24Hour(activity.startTime);
  // const endTime = convertTo24Hour(activity.endTime);

  // if (dtstart) {
  //   dtstart += `T${startTime.replace(/:/g, "")}`;
  //   dtend = dtstart.replace(startTime.replace(/:/g, ""), endTime.replace(/:/g, ""));
  // }

  const defaultDate = "20241220"; // December 20, 2024
  const defaultStartTime = "100000"; // 10:00 AM
  const defaultEndTime = "120000"; // 12:00 PM

  dtstart = dtstart || `${defaultDate}T${defaultStartTime}`;
  dtend = dtend || `${defaultDate}T${defaultEndTime}`;


  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${activity.title || "Untitled Event"}`,
    `DESCRIPTION:${activity.description || "No description provided."}`,
    `LOCATION:${typeof activity.location === "string" ? activity.location : activity.location?.name || "Unknown"}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  console.log("Generated ICS Content:\n", icsContent);

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${activity.title}.ics`;
  link.click();

  URL.revokeObjectURL(url);
};

/** Converts time string to 24-hour format */
const convertTo24Hour = (time) => {
  const periodMatch = time.match(/(am|pm)$/i);
  if (!periodMatch) {
    console.error("Invalid time format:", time);
    return null;
  }

  const period = periodMatch[0].toUpperCase();
  const hourMin = time.replace(/(am|pm)$/i, "");
  let [hour, minutes] = hourMin.split(":").map(Number);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/** Component rendering */
export default function Activities({ activities }: ActivitiesProps) {
  const [activities2, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useUser();
  const [checkedStates, setCheckedStates] = useState<Record<number, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  /** Limits the number of activities per page, with arrows to move to the next and previous pages */
  const totalPages = Math.ceil(activities2.length / itemsPerPage);
  const currentItems = activities2.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** Initializes activities */
  useEffect(() => {
    if (activities) {
      console.log("Setting activities2:", activities);
      setActivities(activities);
    } else {
      console.warn("No activities provided");
    }
  }, [activities]);

  useEffect(() => {
    console.log("Activities data:", activities);
    setActivities(activities);
  }, [activities]);

  /** Move to the next page */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  /** Move to the previous page */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  /** When you click the check mark on going */
  const toggleCheck = (activityId: number) => {
    setCheckedStates((prevState) => ({
      ...prevState,
      [activityId]: !prevState[activityId],
    }));
  };

  /** Fetches attendance information for all activities and checks whether the current user is going */
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.id) return;

      const attendanceCounts: Record<number, number> = {};
      const userCheckedStates: Record<number, boolean> = {};

      for (const activity of activities2) {
        const eventId = activity.id;

        try {
          const eventRef = doc(db, "eventAttendees", eventId.toString());
          const docSnapshot = await getDoc(eventRef);

          attendanceCounts[eventId] = docSnapshot.exists()
            ? docSnapshot.data()?.attendees?.length || 0
            : 0;

          userCheckedStates[eventId] = docSnapshot.exists()
            ? docSnapshot.data()?.attendees?.includes(user.id)
            : false;
        } catch (error) {
          console.error(
            `Error fetching attendance for event ${eventId}:`,
            error
          );
        }
      }

      setAttendanceCounts(attendanceCounts);
      setCheckedStates(userCheckedStates);
    };

    if (activities2.length > 0) {
      fetchAttendanceData();
    }
  }, [activities2, user?.id]);

  /** Grabs favorites from the firebase to show which the user has hearted */
  useEffect(() => {
    if (!user?.id) return;
    const fetchFavorites = async () => {
      try {
        const favoritesRef = doc(db, "favorites", user.id);
        const docSnapshot = await getDoc(favoritesRef);
        if (docSnapshot.exists()) {
          setFavorites(docSnapshot.data().activityIds || []);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, [user?.id]);

  /** Push to firebase when a user favorites an event and change the heart image */
  const toggleFavorite = async (activityId: number) => {
    if (!user?.id) {
      console.error("User is not logged in");
      return;
    }

    const activityIdStr = activityId.toString();
    console.log("Toggling favorite for activity:", activityIdStr);

    try {
      const favoritesRef = doc(db, "favorites", user.id);
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

  /** Push to firebase when a user says they will go to an event */
  const toggleAttendance = async (eventId: number) => {
    if (!user?.id) {
      console.error("User is not logged in");
      return;
    }
  
    const { id: userId, fullName: userName, hasImage, imageUrl } = user;
    const userPhoto = hasImage ? imageUrl : "";
  
    const eventRef = doc(db, "eventAttendees", eventId.toString());
  
    try {
      const docSnapshot = await getDoc(eventRef);
      let attendees = docSnapshot.exists() ? docSnapshot.data()?.attendees || [] : [];
  
      const isAttending = attendees.some(
        (attendee: { userId: string }) => attendee.userId === userId
      );
  
      if (isAttending) {
        const updatedAttendees = attendees.filter(
          (attendee: { userId: string }) => attendee.userId !== userId
        );
        await updateDoc(eventRef, { attendees: updatedAttendees });
  
        setCheckedStates((prevState) => ({
          ...prevState,
          [eventId]: false,
        }));
  
        setAttendanceCounts((prevState) => ({
          ...prevState,
          [eventId]: prevState[eventId] > 0 ? prevState[eventId] - 1 : 0,
        }));
      } else {
        const newAttendee = { userId, userName, userPhoto };
        await updateDoc(eventRef, {
          attendees: arrayUnion(newAttendee),
        });
  
        setCheckedStates((prevState) => ({
          ...prevState,
          [eventId]: true,
        }));
  
        setAttendanceCounts((prevState) => ({
          ...prevState,
          [eventId]: (prevState[eventId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };
  
  /** Fetches attendance counts for all activities */
  const fetchAttendance = async (eventId: number) => {
    try {
      const eventRef = doc(db, "eventAttendees", eventId.toString());
      const docSnapshot = await getDoc(eventRef);
  
      return docSnapshot.exists()
        ? docSnapshot.data()?.attendees?.length || 0
        : 0;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return 0;
    }
  };
  
  /** State and Effect for attendance counts */
  const [attendanceCounts, setAttendanceCounts] = useState<Record<number, number>>({});
  
  useEffect(() => {
    const fetchAllAttendance = async () => {
      const counts: Record<number, number> = {};
      const checked: Record<number, boolean> = {};
  
      for (const activity of activities2) {
        const count = await fetchAttendance(activity.id);
        counts[activity.id] = count;
  
        const eventRef = doc(db, "eventAttendees", activity.id.toString());
        const docSnapshot = await getDoc(eventRef);
        const attendees = docSnapshot.exists() ? docSnapshot.data()?.attendees || [] : [];
        const isUserAttending = attendees.some(
          (attendee: { userId: string }) => attendee.userId === user.id
        );
        checked[activity.id] = isUserAttending;
      }
  
      setAttendanceCounts(counts);
      setCheckedStates(checked);
    };
  
    fetchAllAttendance();
  }, [activities2, user?.id]);
  
  /** Fetch activities if not passed */
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
            startTime: doc.data().start_time,
            endTime: doc.data().end_time || "Unknown",
            image: doc.data().image,
            latitude: doc.data().latitude,
            longitude: doc.data().longitude,
            location: typeof doc.data().location === "object" && doc.data().location.name ? doc.data().location.name : "Unknown",
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
    <div className="flex flex-row items-center justify-center flex-wrap gap-8">
      {currentItems.length === 0 ? (
        <p className="text-center text-gray-500">No activities found.</p>
      ) : (
        currentItems.map((activity) => (
          <div
            key={activity.id}
            className="border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-96 min-h-[440px] max-h-[440px] flex flex-col justify-between gap-4"
          > 
            <div className="flex flex-col gap-2">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h2
                className="paytone-one text-customRed text-xl text-left cursor-pointer"
                onClick={() => navigate(`/activity/${activity.id}`)}
              >
                {activity.title}
              </h2>
            </div>

            <p className="kadwa text-xs text-left overflow-hidden text-ellipsis">
              {activity.description}
            </p>

            <div className="kadwa flex text-s space-x-1">
              <div className="flex flex-col space-y-1">
                <p>{activity.date}</p>
                <p>{`${activity.startTime} - ${activity.endTime}`}</p>
                <div className="flex flex-row space-x-2 max-w-[275px] min-w-[275px]">
                  <img
                    src={RedPin}
                    className="w-4 h-4 object-cover rounded-lg"
                  />
                  <p className="text-xs">
                    {typeof activity.location === "string" ? (
                      <u>{activity.location}</u>
                    ) : typeof activity.location === "object" ? (
                      <u>{activity.location.name || "Unknown"}</u>
                    ) : (
                      "Unknown"
                    )}
                  </p>
                </div>
              </div>
              <p
                className="kadwa text-xs font-bold"
                style={{ marginLeft: "-3px" }}
              >
                {attendanceCounts[activity.id] || 0} Attending
              </p>
            </div>

            <div className="flex flex-row gap-7 items-center justify-center">
              <button
                className="paytone-one text-sm md:text-sm rounded-lg text-customBrown px-2 py-1 mt-1 mb-1 bg-gray-100 hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => createICSFile(activity)}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={CalendarIcon}
                    className="w-6 h-auto object-cover rounded-lg"
                  />
                  <span>Add to Calendar</span>
                </div>
              </button>
              <button
                onClick={async () => {
                  toggleCheck(activity.id);
                  await toggleAttendance(activity.id);
                }}
                className="focus:outline-none text-customBrown paytone-one text-base rounded-lg px-2 py-1 mt-1 mb-1 text-sm bg-gray-100 hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black"
              >
                <div className="flex items-center space-x-1">
                  <img
                    src={
                      checkedStates[activity.id] ? CheckBox : UnfilledCheckBox
                    }
                    alt={checkedStates[activity.id] ? "Checked" : "Unchecked"}
                    className="w-6 h-6"
                  />
                  <span>Going</span>
                </div>
              </button>
              <button onClick={() => toggleFavorite(activity.id)}>
                <img
                  src={
                    favorites.includes(activity.id.toString())
                      ? FilledHeart
                      : UnfilledHeart
                  }
                  className="w-8 h-auto"
                />
              </button>
            </div>
          </div>
        ))
      )}
      <div className="flex items-center justify-end w-full mt-4 pr-20 mr-16">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <img src={BackArrow} alt="Previous" className="w-12 h-12" />
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <img src={ForwardArrow} alt="Next" className="w-12 h-12" />
        </button>
      </div>
    </div>
  );
}
