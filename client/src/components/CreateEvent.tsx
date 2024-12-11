import React, { useState } from "react";

const CreateEvent = ({ addEvent }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
      id: Date.now(),
      title,
      date,
      time: "TBD",
      location,
      description,
      image: "https://via.placeholder.com/300", 
      attendees: 0,
    };

    addEvent(newEvent);

    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-customBrown text-white p-6 flex flex-col items-center">
      <h1 className="limelight text-4xl md:text-6xl mb-6 text-center">
        Submit Event
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-lg space-y-6"
      >
        <div>
          <label className="block text-xl mb-2 paytone-one">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            placeholder="Enter event title"
            required
          />
        </div>
        <div>
          <label className="block text-xl mb-2 paytone-one">Event Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            required
          />
        </div>
        <div>
          <label className="block text-xl mb-2 paytone-one">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            placeholder="Enter event location"
            required
          />
        </div>
        <div>
          <label className="block text-xl mb-2 paytone-one">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            placeholder="Enter event description"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="paytone-one bg-customRed text-white rounded-lg px-4 py-2 text-xl"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
