import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { user } = useUser();
  const [isAnonymous, setIsAnonymous] = useState(false);

  const favoritedEvents = [
    { id: 1, title: "Music Festival" },
    { id: 2, title: "Coding Workshop" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Art Exhibit" },
    { id: 2, title: "Tech Conference" },
  ];

  const navigate = useNavigate();
  const backToMain = () => {
    navigate("/"); 
  };

  return (
    <div className="min-h-screen bg-customBrown text-white p-6">
      <div className="flex justify-center mt-6">
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
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-customRed p-6 rounded-lg">
          <h3 className="paytone-one text-2xl mb-4">Favorited Events</h3>
          <ul className="list-disc ml-6 space-y-2">
            {favoritedEvents.map((event) => (
              <li key={event.id} className="text-md">
                {event.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-customRed p-6 rounded-lg">
          <h3 className="paytone-one text-2xl mb-4">Upcoming Events</h3>
          <ul className="list-disc ml-6 space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="text-md">
                {event.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
