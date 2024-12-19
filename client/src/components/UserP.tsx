import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { db } from "./Activities";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { Activity } from "../activityData";

interface ActivityEvent {
  id: string;
  title: string;
}

export default function UserP() {
  const { user } = useUser();
  const [goingEvents, setGoingEvents] = useState<Activity[]>([]);
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
              image: doc.data().image,
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
    fetchFavorites();
}, [user?.id]);

  const backToMain = () => {
    navigate("/"); 
  };

  useEffect(() => {
    const fetchGoingEvents = async () => {
      if (!user?.id) return;

      try {
        const attendeesCollectionRef = collection(db, "eventAttendees");
        const q = query(attendeesCollectionRef, where("attendees", "array-contains", { userId: user.id }));
        const querySnapshot = await getDocs(q);

        const events: Activity[] = [];
        for (const docSnapshot of querySnapshot.docs) {
          const eventId = docSnapshot.id;
          const activityDocRef = doc(db, "activities", eventId);
          const activitySnapshot = await getDoc(activityDocRef);

          if (activitySnapshot.exists()) {
            const data = activitySnapshot.data();
            events.push({
              id: parseInt(eventId, 10),
              title: data.title,
              description: data.description,
              date: data.date,
              startTime: data.start_time,
              endTime: data.end_time,
              image: data.image,
              latitude: data.latitude,
              longitude: data.longitude,
              location:
                typeof data.location === "object" && data.location.name
                  ? data.location.name
                  : "Unknown",
              attendance: data.attendance,
              attendees: data.attendees,
              time: data.time,
              category: data.category,
              onCampus: data.onCampus,
            });
          }
        }
        console.error("going events:", events);
        setGoingEvents(events);
      } catch (error) {
        console.error("Error fetching 'Going' events:", error);
      }
    };

    fetchGoingEvents();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-customBrown text-white p-6">
      <div className="flex justify-start mt-6">
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
        <div className="bg-customLightBrown p-6 rounded-3xl">
          <h3 className="paytone-one text-xl md:text-3xl mb-4 text-customRed">
            Favorited Events
          </h3>
          <ul className="divide-y divide-customBrown">
            {favoritedEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center space-x-4 py-4"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-24 h-16 rounded-lg object-cover"
                />
                <a
                  href={`/activity/${event.id}`}
                  className="kadwa text-md text-customBrown hover:text-customRed underline"
                >
                  {event.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-customLightBrown p-6 rounded-3xl">
        <h3 className="paytone-one text-xl md:text-3xl mb-4 text-customRed">
        Upcoming Events
      </h3>
      {goingEvents.length === 0 ? (
        <p className="kadwa text-customBrown">You haven't selected any events yet.</p>
      ) : (
        <ul className="divide-y divide-customBrown">
          {goingEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-center space-x-4 py-4 cursor-pointer"
              onClick={() => navigate(`/activity/${event.id}`)}
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-24 h-16 rounded-lg object-cover"
              />
              <h2 className="kadwa text-md text-customBrown hover:text-customRed">
                {event.title}
              </h2>
            </li>
          ))}
        </ul> )}
        </div>
      </div>
    </div>
  );
}
