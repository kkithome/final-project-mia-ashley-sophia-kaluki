import { useState } from "react";
import '../output.css';

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
    image: "", // TODO: add mock image
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
    image: "",
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
    image: "",
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
    image: "",
    date: "2024-11-25",
    time: "5:00 PM",
    attendees: 47,
    location: "Metcalf Research Building",
  },
];

export default function Activities() {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {activities.map((activity) => (
        <div
          key={activity.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            width: "300px",
            textAlign: "center",
          }}
        >
          <img
            src={activity.image}
            alt={activity.title}
            style={{ width: "100%", height: "150px", objectFit: "cover" }}
          />
          <h2>{activity.title}</h2>
          <p>{activity.description}</p>
          <p>
            <strong>Date:</strong> {activity.date}
          </p>
          <p>
            <strong>Time:</strong> {activity.time}
          </p>
          <p>
            <strong>Location:</strong> {activity.location}
          </p>
          <p>{activity.attendees} Attending</p>
          <button
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
            onClick={() => alert(`${activity.title} added to your favorites!`)}
          >
            Add to Favorites
          </button>
        </div>
      ))}
    </div>
  );
}
