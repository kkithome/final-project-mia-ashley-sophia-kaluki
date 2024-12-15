package edu.brown.cs.student.main.server.handlers.Events;

import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.handlers.Pins.FetchPinsHandler;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class FetchEventsHandler implements Route {
  public StorageInterface eventStorageHandler;

  public FetchEventsHandler(StorageInterface eventStorageHandler) {
    this.eventStorageHandler = eventStorageHandler;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String,Object> responseMap = new HashMap<>();
    try {
      System.out.println("Listing all events");
      List<Map<String, Object>> vals = this.eventStorageHandler.getCollection("general", "activities");

      if (vals == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "No events found");
        return Utils.toMoshiJson(responseMap);
      }

      List<Map<String, Object>> events = new ArrayList<>();

      for (Map<String, Object> event : events) {
        Map<String, Object> eventData = new HashMap<>();

        eventData.put("source", event.get("source"));
        eventData.put("id", event.get("id"));
        eventData.put("title", event.get("title"));
        eventData.put("description", event.get("description"));
        eventData.put("image", event.get("image"));
        eventData.put("date", event.get("date"));
        eventData.put("start_time", event.get("start_time"));
        eventData.put("end_time", event.get("end_time"));
        eventData.put("attendance", event.get("attendance"));
        eventData.put("attendees", event.get("attendees"));
        eventData.put("location", event.get("location"));
        eventData.put("category", event.get("category"));
        eventData.put("onCampus", event.get("onCampus"));

        events.add(eventData);
      }

      responseMap.put("response_type", "success");
      responseMap.put("events", events);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    System.out.println("Pins to Return: " + responseMap);
    return Utils.toMoshiJson(responseMap);
  }
}
