import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { db } from "./Activities";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

interface ActivityEvent {
  id: string;
  title: string;
}

export default function UserP() {
  const { user } = useUser();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [favoritedEvents, setFavoritedEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) {
        console.warn("No user ID found");
        setLoading(false);
        return;
      }
    
      console.log("Fetching favorites for user:", user.id);
    
      try {
        const favoritesRef = doc(db, "favorites", user.id);
        const docSnapshot = await getDoc(favoritesRef);
    
        if (docSnapshot.exists()) {
          const favoriteEventIds: string[] = docSnapshot.data().activityIds || [];
          console.log("Favorite event IDs:", favoriteEventIds);
    
          const activitiesCollection = collection(db, "activities");
          const activitiesSnapshot = await getDocs(activitiesCollection);
    
          const events: ActivityEvent[] = activitiesSnapshot.docs
            .filter((doc) => {
              const activityId = doc.data().id;
              return favoriteEventIds.includes(activityId.toString());
            })
            .map((doc) => ({
              id: doc.data().id,
              title: doc.data().title,
            }));
    
          console.log("Filtered favorited events:", events);
    
          setFavoritedEvents(events);
        } else {
          console.log("No favorites document found for user ID:", user.id);
        }
      } catch (error) {
        console.error("Error fetching favorited events:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; 
        const activitiesCollection = collection(db, "activities");
        const upcomingQuery = query(activitiesCollection, where("date", ">=", today));
        const querySnapshot = await getDocs(upcomingQuery);

        const events: ActivityEvent[] = querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          title: doc.data().title,
          date: doc.data().date,
        }));

        console.log("Upcoming events:", events);
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };
    
    fetchFavorites();
    fetchUpcomingEvents();
    
  }, [user?.id]);

  

  const backToMain = () => {
    navigate("/"); 
  };

  return (
    <div className="min-h-screen bg-customBrown text-white p-6">
      <div className="flex justify-start mt-6">
        <button
          onClick={backToMain}
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl"
        >
          Back to Main
        </button>
      </div>
      <h1 className="limelight text-4xl md:text-6xl mb-6 text-center">
        User Profile
      </h1>
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-4">
          <label className="paytone-one text-xl">Profile Visibility:</label>
          <button
            onClick={() => setIsAnonymous((prev) => !prev)}
            className={`px-4 py-2 rounded-lg text-white paytone-one ${
              isAnonymous ? "bg-gray-500" : "bg-customRed"
            }`}
          >
            {isAnonymous ? "Stay Anonymous" : "Show Profile"}
          </button>
        </div>
        {!isAnonymous && (
          <>
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt={`${user.fullName}'s profile`}
                className="w-32 h-32 rounded-full border-4 border-customRed"
              />
            )}
            <h2 className="paytone-one text-3xl">{user?.fullName || "Anon"}</h2>
            {/* Create event button — delay for now */}
            {/* <button
              onClick={() => navigate("/create-event")}
              className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl mt-4"
            >
              Create Event
            </button> */}
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-customLightBrown p-6 rounded-lg">
          <h3 className="paytone-one text-2xl mb-4 text-customRed">
            Favorited Events
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            {favoritedEvents.map((event) => (
              <li key={event.id} className="text-md text-black">
                {event.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-customLightBrown p-6 rounded-lg">
          <h3 className="paytone-one text-2xl mb-4 text-customRed">
            Upcoming Events
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="text-md text-black">
                {event.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
