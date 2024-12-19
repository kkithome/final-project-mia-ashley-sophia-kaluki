import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./Activities";
import { Activity } from "../activityData";

const searchActivities = async (keyword: string = "", filters: any = {}): Promise<Activity[]> => {
  const { isOnCampus, startDate, endDate, category, time } = filters;
  const searchCollection = collection(db, "activities");
  const startDateFilter = startDate || new Date().toISOString().split("T")[0];

  /** initially get all activities and then start to filter them */
  try {
    let baseQuery = query(searchCollection, where("date", ">=", startDateFilter));

    /** filtering by category */
    if (category) {
      baseQuery = query(baseQuery, where("category", "==", category));
    }

    const querySnapshot = await getDocs(baseQuery);

    let fetchedActivities: Activity[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const location = data.location || {};
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
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

    /** searching title & description for keyword */
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      fetchedActivities = fetchedActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(lowerKeyword) ||
          activity.description.toLowerCase().includes(lowerKeyword)
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

/** change time string to 24 hour */
const convertTo24Hour = (time: string): string => {
  const [hourMin, period] = time.split(" ");
  let [hour, minutes] = hourMin.split(":").map(Number);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export default searchActivities;
