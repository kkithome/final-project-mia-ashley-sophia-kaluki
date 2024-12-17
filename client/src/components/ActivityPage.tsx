import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./Activities";
import { useUser } from "@clerk/clerk-react";
import { Activity } from "../activityData";
import "../styles/App.css";
import UnfilledHeart from "../assets/UnfilledHeart.png";
import FilledHeart from "../assets/FilledHeart.png";  
import "../styles/index.css";
import CalendarIcon from "../assets/CalendarIcon.png"; 

export default function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

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
            startTime: data.startTime,
            endTime: data.endTime,
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

  const { user } = useUser();

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

  return (
    <div className="min-h-screen bg-customBrown text-white p-6">
      <div className="flex justify-start">
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
            <p className="kadwa text-lg mb-6 text-black">{activity.description}</p>
            <div className="kadwa text-lg space-y-4 text-black">
              <p>
                <strong>Date:</strong> {activity.date}
              </p>
              <p>
                <strong>Time:</strong> {activity.startTime}
              </p>
              {/* <p>
                <strong>Location:</strong> {activity.location}
              </p> */}
            </div>
            <div className="flex flex-row space-x-4 mt-6 items-center justify-center">
              {/* <button
                className="kadwa rounded-full px-4 py-3 mt-2 mb-2 text-sm border text-black border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => createICSFile(activity)}
              >
                Add to Calendar
              </button> */}
              <button
                className="paytone-one text-sm md:text-sm rounded-lg text-customBrown px-2 py-1 mt-1 mb-1 bg-gray-100 hover:bg-brown-700 hover:text-customRed focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => createICSFile(activity)}
              >
                <div className="flex items-center space-x-2">
                  <img src={CalendarIcon} className="w-6 h-auto object-cover rounded-lg" />
                  <span>Add to Calendar</span>
                </div>
              </button>
              {/* <button
                className="kadwa rounded-full px-4 py-3 text-sm border text-black border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => alert(`${activity.title} added to favorites!`)}
              >
                Add to Favorites
              </button> */}
              <button onClick={() => toggleFavorite(activity.id)}>
                <img
                  src={favorites.includes(activity.id.toString()) ? FilledHeart : UnfilledHeart}
                  className="w-8 h-auto"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
