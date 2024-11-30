import { useState } from "react";
import '../output.css';
import '../styles/App.css';
import '../styles/index.css';

interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  attendees: number;
  location: string;
}

// Mock data
const activities: Activity[] = [
  {
    id: 1,
    title: "Brown Resgiving 2024: Afternoon High Tea Party",
    description:
      "Looking for a delightful way to spend Fall Break? Join us for Brown Resgiving 2024: Afternoon High Tea Party! ...see more",
    // TODO: is description necessary? what is the display limit
    image: "https://events.brown.edu/live/image/scale/2x/gid/1/width/300/height/300/crop/1/13607_BrownResgiving2023.rev.1699989289.webp", // TODO: add mock image
    date: "2024-11-27",
    time: "1:00 PM",
    attendees: 30,
    location: "Pembroke Green",
  },
  {
    id: 2,
    title: "Fall Dance Concert",
    description:
      "Step into a world where stories unfold through the power of movement. The 2024 Fall Dance Concert features ...see more",
    image: "https://taps.brown.edu/sites/default/files/2024-09/IMG_9874.JPG",
    date: "2024-11-24",
    // TODO: make sure scraped data can be processed / converted to the same date format
    time: "2:00 PM",
    attendees: 50,
    location: "Ashamu Dance Studio",
  },
  {
    id: 3,
    title: "MUSE Foundation 25th Annual Toy Drive",
    description:
      "Brown University is proud to partner with the MUSE Foundation of Rhode Island for the 25th Annual #YESpvd! ...see more",
    image: "https://events.brown.edu/live/image/scale/2x/gid/108/width/300/height/388/crop/1/17509_Red_Modern_Toy_Drive_Flyer_4.rev.1732309946.webp",
    date: "All Day (until December 12)",
    // TODO: how will calendar invites works for long-term events / events w/ no exact time?
    time: "7:00 AM",
    attendees: 15,
    location: "Brown University Bookstore",
  },
  {
    id: 4,
    title: "Movie Screening: The Crazies (1973)",
    description:
      "It’s time for our second screening of the month, and this one’s a classic you won’t want to miss. ...see more",
    image: "https://coolidge.org/sites/default/files/featured_images/Matilda_1996_16%20copy.jpg",
    date: "2024-11-25",
    time: "5:00 PM",
    attendees: 47,
    location: "Metcalf Research Building",
  },
];

export default function Activities() {
  return (
    <div className="flex flex-row items-center justify-center flex-wrap gap-8 space-x-5 md:space-x-8">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="border border-customLightBrown bg-customLightBrown rounded-2xl p-4 w-96 h-130 text-center space-y-2"
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
            onClick={() => alert(`Added ${activity.title} to your calendar!`)}
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
