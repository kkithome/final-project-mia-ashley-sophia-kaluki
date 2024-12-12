package edu.brown.cs.student.main.server.handlers.Events;

import edu.brown.cs.student.main.server.Objects.Event;
import edu.brown.cs.student.main.server.Objects.Utils;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class ScraperHandler implements Route {
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
      responseMap.put("result", "success");
      responseMap.put("message", "Scraping succeeded");
      responseMap.put("data", events);
    } catch (IOException | InterruptedException e) {
      responseMap.put("result", "error");
      responseMap.put("message", "Error occurred while scraping");
      responseMap.put("error_details", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
