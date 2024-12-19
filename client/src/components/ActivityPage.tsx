import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
//import { db } from "./Activities";
import { useUser } from "@clerk/clerk-react";
import { Activity } from "../activityData";
import "../styles/App.css";
import UnfilledHeart from "../assets/UnfilledHeart.png";
import FilledHeart from "../assets/FilledHeart.png";  
import "../styles/index.css";
import CalendarIcon from "../assets/CalendarIcon.png"; 
import { getFirestore } from "firebase/firestore";
import firebaseConfig2 from "../../resources/firebase2.js";
import CheckBox from "../assets/CheckBox.png";
import UnfilledCheckBox from "../assets/UnfilledCheckBox.png";
import ShareButton from "../assets/ShareButton.png"; 
import RedPin from "../assets/RedPin.png";


interface ActivitiesProps {
  activities: Activity[];
}

/** create database if needed */
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

/** this method creates a .ics file download so the user can add the event to their calendar */
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

/** this method converts the time string to a more readable format */
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
  const [checkedStates, setCheckedStates] = useState<Record<number, boolean>>(
    {}
  );
  const { user } = useUser();
  const navigate = useNavigate();
  const [activities2, setActivities] = useState<Activity[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<{ userName: string; userPhoto: string }[]>([]);
  const [attendanceCounts, setAttendanceCounts] = useState<
    Record<number, number>
  >({});

  /** change the image on the checkmark when user clicks it */
  const toggleCheck = (activityId: number) => {
    setCheckedStates((prevState) => ({
      ...prevState,
      [activityId]: !prevState[activityId],
    }));
  };

  /** get the list of attendees */
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

  /** get the specific activity by id */
  useEffect(() => {
    console.log("fetching activities")
    const fetchActivity = async () => {
      try {
        const searchCollection = collection(db, "activities");
        const querySnapshot = await getDocs(searchCollection);

        const fetchedActivities: Activity[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const location = data.location || {};
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            date: data.date,
            startTime: data.start_time,
            endTime: data.end_time || "Unknown",
            image: data.image,
            location: location.name || "Unknown",
            latitude: location.latitude || "Unknown",
            longitude: location.longitude || "Unknown",
            attendance: data.attendance,
            attendees: data.attendees,
            time: data.time,
            category: data.category,
            onCampus: data.onCampus,
          };
        });

        const foundActivity = fetchedActivities.find(
          (activity) => activity.id === parseInt(id || "", 10)
        );
        setActivity(foundActivity || null);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  /** get favorites to know if the heart should be filled or not */
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

  /** change the heart image + update firebase */
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

  /** list of attendees */
  const fetchAttendees = async (activityId: string) => {
    try {
      const attendeesDocRef = doc(db, "eventAttendees", activityId);
      const attendeesSnapshot = await getDoc(attendeesDocRef);
      if (attendeesSnapshot.exists()) {
        setAttendees(attendeesSnapshot.data().attendees || []);
      } else {
        setAttendees([]);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  useEffect(() => {
    if (activity?.id) {
      fetchAttendees(activity.id.toString());
    }
  }, [activity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-customBrown text-white">
        <h1 className="paytone-one text-4xl">Loading...</h1>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-customBrown text-white">
        <h1 className="paytone-one text-4xl mb-10">Activity Not Found</h1>
        {/* <button
          onClick={() => navigate(-1)}
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl mt-4"
        >
          Back to Main
        </button> */}
        <button 
          onClick={() => navigate(-1)}
          className="bg-customRed text-white px-4 py-2 rounded-lg flex items-center mb-8 paytone-one space-x-2"
        >
          <div className="back-arrow">
          </div>
          <svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="white"><path d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span>Back to main</span>
        </button>
      </div>
    );
  }

  /** create calendar event download when clicked */
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
      // `LOCATION:${activity.location}`,
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

  const convertTo24Hour = (time: string) => {
    const [hourMin, period] = time.split(" ");
    let [hour, minutes] = hourMin.split(":").map(Number);

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  /** update firebase + local state when user clicks going */
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
        attendees = attendees.filter(
          (attendee: { userId: string }) => attendee.userId !== userId
        );
        await updateDoc(eventRef, { attendees });
        setCheckedStates((prevState) => ({
          ...prevState,
          [eventId]: false,
        }));
        setAttendanceCounts((prevState) => ({
          ...prevState,
          [eventId]: prevState[eventId] > 0 ? prevState[eventId] - 1 : 0,
        }));
      } else {
        attendees = [...attendees, { userId, userName, userPhoto }];
        await updateDoc(eventRef, { attendees });
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

  /** handle going button click */
  const handleGoingClick = async (activityId: number) => {
    await toggleAttendance(activityId);
  };

  return (
    <div className="min-h-screen bg-customBrown text-white flex items-center justify-center p-6">
      <div className="relative w-8/10 lg:w-3/4">
        {/* back to main button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-[230px] md:-top-8 left-0 bg-customRed text-white px-4 py-2 rounded-lg flex items-center space-x-2 paytone-one"
        >
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="white"
          >
            <path
              d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span>Back to main</span>
        </button>
        <div
          key={activity.id}
          className="flex flex-row mt-[-180px] md:mt-8 border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-full h-auto text-left space-y-2"
        >
          {/* left col (title, description, image, time, calendar button) */}
          <div className="flex flex-col justify-start w-2/3 md:w-7/12 ml-2 md:ml-4 lg:ml-8 mt-2 md:mt-2 lg:mt-4">
            <div className="flex flex-row space-x-3 lg:space-x-8">
              <h1 className="paytone-one text-2xl md:text-4xl mb-4 text-customRed">
                {activity.title}
              </h1>
              <button className="mb-4" onClick={() => toggleFavorite(activity.id)}>
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
            <p className="kadwa text-sm md:text-base mb-6 text-customBrown w-5/6">{activity.description}</p>
              <img
                src={activity.image}
                alt={activity.title}
                className="w-5/6 max-w-lg h-42 object-cover rounded-lg"
              />
            <div className="flex flex-row space-x-4">
            <div className="kadwa text-xs md:text-base space-y-4 text-customBrown">
              <p className="flex flex-col font-bold mt-3">
                <span>{activity.date}</span>
                <span>{`${activity.startTime} - ${activity.endTime}`}</span>
              </p>
            </div>
            <button
                  className="w-36 md:w-44 h-10 mt-2 mb-6 paytone-one text-xs md:text-sm rounded-lg text-customBrown px-2 bg-gray-100 hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black"
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
            </div>
          </div>

          {/* right col: */}
            <div className="flex flex-col ml-3 lg:ml-2 justify-start w-1/2">
              {/* attendees section */}
              <div className="flex flex-col">
                <div className="bg-gray-100 rounded-lg p-4 text-customBrown w-84 mb-3 mr-3">
                  <h2 className="paytone-one text-lg md:text-2xl mb-4 text-customRed">
                    Attendees
                  </h2>
                  {attendees.length === 0 ? (
                    <p className="text-gray-500">No attendees yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {attendees.map((attendee, index) => (
                        <li key={index} className="flex items-center space-x-4">
                          <img
                            src={attendee.userPhoto || "/default-avatar.png"} 
                            alt={attendee.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="kadwa text-base md:text-lg">{attendee.userName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-row space-x-4 items-start text-base md:text-xl ">
                  <button
                    onClick={() => handleGoingClick(activity.id)}
                    className="focus:outline-none w-28 md:w-32 h-12 text-customBrown paytone-one rounded-lg px-2 py-2 mt-1 mb-1 text-sm bg-gray-100 hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <div className="flex items-center space-x-3 ml-2">
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
                  <button
                        onClick={async () => {
                          toggleCheck(activity.id);
                          await toggleAttendance(activity.id);
                        }}
                        className="focus:outline-none w-28 md:w-32 h-12 text-white paytone-one rounded-lg px-2 py-1 mt-1 mb-1 text-sm bg-customRed hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black mr-2"
                      >
                        <div className="flex items-center space-x-3 ml-2">
                          <img
                            src={ShareButton}
                            className="w-6 h-6"
                          />
                          <span>Share</span>
                        </div>
                  </button>
                </div>
                <div className="flex flex-row space-x-2 mt-4">
                  <img
                    src={RedPin}
                    className="w-4 h-4 object-cover rounded-lg"
                  />
                    <p className="kadwa text-sm md:text-base text-customBrown">
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
            </div>
        </div>
      </div>
    </div>
  );
}  