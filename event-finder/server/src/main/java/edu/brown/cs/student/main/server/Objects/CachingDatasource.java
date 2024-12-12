package edu.brown.cs.student.main.server.Objects;

import com.google.common.cache.Cache;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import com.squareup.moshi.Types;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class CachingDatasource implements Route {

  private final Cache<String, List<Event>> cache;
  private final EventDatasource datasource;

  public CachingDatasource(Cache<String, List<Event>> cache, EventDatasource datasource) {
    this.cache = cache;
    this.datasource = datasource;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Moshi moshi = new Moshi.Builder().build();
    Type listEventType = Types.newParameterizedType(List.class, Event.class);
    JsonAdapter<List<Event>> listAdapter = moshi.adapter(listEventType);

    Map<String, Object> responseMap = new HashMap<>();
    String source = request.queryParams("source");

    if (source == null) {
      responseMap.put("result", "error_bad_request");
      responseMap.put("message", "Source cannot be null");
      response.status(400); // Bad request
      return new Moshi.Builder().build().adapter(Map.class).toJson(responseMap);
    }

    try {
      // Check cache for events
      List<Event> events = cache.getIfPresent(source);

      if (events == null) {
        // Fetch events from the underlying datasource
        events = datasource.getEvents(source);

        if (events != null && !events.isEmpty()) {
          cache.put(source, events); // Cache the results
        } else {
          responseMap.put("result", "error_no_data");
          responseMap.put("message", "No events found for the specified source");
          response.status(404); // Not found
          return new Moshi.Builder().build().adapter(Map.class).toJson(responseMap);
        }
      }

      // Convert events to JSON and respond
      responseMap.put("result", "success");
      responseMap.put("events", listAdapter.toJson(events));
      response.status(200); // OK
      return new Moshi.Builder().build().adapter(Map.class).toJson(responseMap);

    } catch (Exception e) {
      responseMap.put("result", "error_internal");
      responseMap.put("message", "An error occurred while processing the request");
      response.status(500); // Internal server error
      return new Moshi.Builder().build().adapter(Map.class).toJson(responseMap);
    }
  }
}
