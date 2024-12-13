import { useState } from "react";
import Mapbox from "./Mapbox";
import Activities from "./Activities";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import Bear4 from "../assets/Bear4.png";
import { UserButton } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { activities } from "../activityData";

export default function ActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const activity = activities.find(
    (activity) => activity.id === parseInt(id || "", 10)
  );

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
      {/* Navigation back button */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl"
        >
          Back to Main
        </button>
      </div>
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
          <p className="kadwa text-lg mb-6">{activity.description}</p>
          <div className="kadwa text-lg space-y-4">
            <p>
              <strong>Date:</strong> {activity.date}
            </p>
            <p>
              <strong>Time:</strong> {activity.time}
            </p>
            <p>
              <strong>Location:</strong> {activity.location}
            </p>
            <p>
              <strong>Attendees:</strong> {activity.attendees}
            </p>
          </div>
          <div className="flex flex-row space-x-4 mt-6">
            <button
              className="kadwa rounded-full px-4 py-3 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => alert(`Added ${activity.title} to your calendar!`)}
            >
              Add to Calendar
            </button>
            <button
              className="kadwa rounded-full px-4 py-3 text-sm border border-black bg-gray-100 hover:bg-brown-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => alert(`${activity.title} added to favorites!`)}
            >
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
