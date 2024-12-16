import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./Activities";
import { Activity } from "../activityData";

const searchActivities = async (keyword: string = "", filters: any = {}) => {
  const { isOnCampus, startDate, endDate, category, time } = filters;

  const searchCollection = collection(db, "activities");
  let startDateFilter = startDate || new Date().toISOString().split("T")[0];

  try {
    let baseQuery = query(searchCollection, where("date", ">=", startDateFilter));

    if (category) {
      baseQuery = query(baseQuery, where("category", "==", category));
    }

    const querySnapshot = await getDocs(baseQuery);

    let fetchedActivities: Activity[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        image: data.image,
        location: typeof data.location === "object" && data.location.name ? data.location.name : "Unknown",
        latitude: data.location?.latitude || "Unknown",
        longitude: data.location?.longitude || "Unknown",
        attendance: data.attendance,
        attendees: data.attendees,
        time: data.time,
        category: data.category,
        onCampus: data.onCampus,
      };
    });    

    if (keyword) {
      fetchedActivities = fetchedActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(keyword.toLowerCase()) ||
          activity.description.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (time) {
        const timeRanges = {
          morning: { start: "06:00", end: "11:59" },
          afternoon: { start: "12:00", end: "17:59" },
          evening: { start: "18:00", end: "23:59" },
        };
  
        const { start, end } = timeRanges[time];
        fetchedActivities = fetchedActivities.filter((activity) => {
          const activityTime = convertTo24Hour(activity.startTime);
          return activityTime >= start && activityTime <= end;
        });
      }

    return fetchedActivities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

const convertTo24Hour = (time: string) => {
    const [hourMin, period] = time.split(" ");
    let [hour, minutes] = hourMin.split(":").map(Number);
  
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  
    return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

export default searchActivities;