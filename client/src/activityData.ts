export interface Activity {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    startTime: string;
    endTime: string; 
    attendees?: string[];
    attendance: number; 
    location: string | { name: string; latitude?: string; longitude?: string };
    category?: string; 
    onCampus?: boolean; 
    longitude: string; 
    latitude: string;
    time?: string; 
  }
  
  export const activities: Activity[] = [
    {
      id: 1,
      title: "Brown Resgiving 2024: Afternoon High Tea Party",
      description:
        "Looking for a delightful way to spend Fall Break? Join us for Brown Resgiving 2024: Afternoon High Tea Party! ...see more",
      image: "https://events.brown.edu/live/image/scale/2x/gid/1/width/300/height/300/crop/1/13607_BrownResgiving2023.rev.1699989289.webp",
      date: "2024-11-27",
      startTime: "1:00 PM",
      endTime: "3:00",
      attendees: ["Emma", "Ryan", "Martin"],
      attendance: 30,
      location: "Pembroke Green",
      category: "Food",
      onCampus: true,
      longitude: "",
      latitude: "", 
    },
    {
      id: 2,
      title: "Fall Dance Concert",
      description:
        "Step into a world where stories unfold through the power of movement. The 2024 Fall Dance Concert features ...see more",
      image: "https://taps.brown.edu/sites/default/files/2024-09/IMG_9874.JPG",
      date: "2026-11-24",
      startTime: "1:00 PM",
      endTime: "3:00",
      attendees: ["Emma", "Ryan", "Martin"],
      attendance: 50,
      location: "Ashamu Dance Studio",
      category: "Show",
      onCampus: true,
      longitude: "",
      latitude: "", 
    },
    {
      id: 3,
      title: "MUSE Foundation 25th Annual Toy Drive",
      description:
        "Brown University is proud to partner with the MUSE Foundation of Rhode Island for the 25th Annual #YESpvd! ...see more",
      image: "https://events.brown.edu/live/image/scale/2x/gid/108/width/300/height/388/crop/1/17509_Red_Modern_Toy_Drive_Flyer_4.rev.1732309946.webp",
      date: "All Day (until December 12)",
      startTime: "1:00 PM",
      endTime: "3:00",
      attendees: ["Emma", "Ryan", "Martin"],
      attendance: 15,
      location: "Brown University Bookstore",
      category: "Show",
      onCampus: true,
      longitude: "",
      latitude: "", 
    },
    {
      id: 4,
      title: "Movie Screening: The Crazies (1973)",
      description:
        "It’s time for our second screening of the month, and this one’s a classic you won’t want to miss. ...see more",
      image: "https://coolidge.org/sites/default/files/featured_images/Matilda_1996_16%20copy.jpg",
      date: "2024-11-25",
      startTime: "1:00 PM",
      endTime: "3:00",
      attendees: ["Emma", "Ryan", "Martin"],
      attendance: 47,
      location: "Metcalf Research Building",
      category: "Show",
      onCampus: true,
      longitude: "",
      latitude: "", 
    },
  ];