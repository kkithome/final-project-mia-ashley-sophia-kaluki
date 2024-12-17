package edu.brown.cs.student.main.server.handlers.Events;

import edu.brown.cs.student.main.server.Objects.Utils;
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
    Map<String, Object> responseMap = new HashMap<>();
    try {
      System.out.println("Listing all events");
      List<Map<String, Object>> vals = this.eventStorageHandler.getCollection("activities");

      if (vals == null) {
        responseMap.put("response_type", "failure");
        responseMap.put("error", "No events found");
        return Utils.toMoshiJson(responseMap);
      }

      List<Map<String, Object>> events = new ArrayList<>();

      for (Map<String, Object> event : vals) {
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
        eventData.put("category", event.get("category"));
        eventData.put("onCampus", event.get("onCampus"));

        Map<String, Object> location = (Map<String, Object>) event.get("location");
        if (location != null) {
          Map<String, Object> locationData = new HashMap<>();
          locationData.put("name", location.get("name"));
          locationData.put("latitude", location.get("latitude"));
          locationData.put("longitude", location.get("longitude"));
          locationData.put("url", location.get("url"));
          eventData.put("location", locationData);

        } else {
          eventData.put("location", null);
        }
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
