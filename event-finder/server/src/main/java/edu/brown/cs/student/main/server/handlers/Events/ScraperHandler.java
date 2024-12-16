package edu.brown.cs.student.main.server.handlers.Events;

import com.google.cloud.firestore.DocumentReference;
import edu.brown.cs.student.main.server.Objects.Event;
import edu.brown.cs.student.main.server.Objects.Location;
import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import io.grpc.Context.Storage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import spark.Request;
import spark.Response;
import spark.Route;

public class ScraperHandler implements Route {
  public StorageInterface eventStorageHandler;

  public ScraperHandler(StorageInterface eventStorageHandler) {
    this.eventStorageHandler = eventStorageHandler;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();

    String source = request.queryParams("source");

    if (source == null || source.isEmpty()) {
      responseMap.put("result", "error_bad_request");
      responseMap.put("message", "Source cannot be null");
      return Utils.toMoshiJson(responseMap);
    }

    try {
      List<Event> events = ScraperUtility.scrapeData(source);
      saveToFirestore(events);
      responseMap.put("result", "success");
      responseMap.put("message", "Scraping and saving to firestore was successful");
      responseMap.put("data", events);
    } catch (IOException | InterruptedException | ExecutionException e) {
      responseMap.put("result", "error");
      responseMap.put("message", "Error occurred while scraping");
      responseMap.put("error_details", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }

  private void saveToFirestore(List<Event> events) throws ExecutionException, InterruptedException {
    Map<String, Object> eventData = new HashMap<>();

    List<Map<String,Object>> allEvents = this.eventStorageHandler.getCollection("general",
        "activities");

    if (allEvents == null) {
      allEvents = new ArrayList<>();
    }
    for (Event event: events) {
      String eventSource = event.getSource();
      String eventTitle = event.getTitle();
      String eventDate = event.getDate();
      String eventID = eventSource + " - " + eventTitle + " " + eventDate ;

    boolean eventInFirestore =  this.eventStorageHandler.docExists("general",
          "activities", eventID);

    if (eventInFirestore) {
      System.out.println("Event already exists: " + eventID);
      continue;
    }

      eventData.put("source", event.getSource());
      eventData.put("id", event.getId());
      eventData.put("title", event.getTitle());
      eventData.put("description", event.getDescription());
      eventData.put("image", event.getImage());
      eventData.put("date", event.getDate());
      eventData.put("start_time", event.getStart_time());
      eventData.put("end_time", event.getEnd_time());
      eventData.put("attendance", event.getAttendance());
      eventData.put("attendees", event.getAttendees());
      eventData.put("location", event.getLocation());
      eventData.put("category", event.getCategory());
      eventData.put("onCampus", event.getOnCampus());

      if (event.getLocation() != null) {
        Location location = event.getLocation();
        eventData.put("event_name", location.getName());
        eventData.put("latitude", location.getLatitude());
        eventData.put("longitude", location.getLongitude());
        eventData.put("url", location.getUrl());
      }

      this.eventStorageHandler.addDocument("general", "activities", eventID, eventData);
      allEvents.add(eventData);

    }
  }
}
