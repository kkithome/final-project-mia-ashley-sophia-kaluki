package edu.brown.cs.student.main.server.handlers.Pins;

import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;

import java.util.ArrayList;
import java.util.HashMap;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import spark.Request;
import spark.Response;
import spark.Route;

public class SavePinsHandler implements Route {

  public StorageInterface storageHandler;


  public SavePinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();

    // collect parameters from the request
    try {
      String uid = request.queryParams("uid");
      String lat = request.queryParams("lat");
      String lon = request.queryParams("long");

      if (uid == null || uid.isEmpty() || lat == null || lon == null) {
        throw new IllegalArgumentException("Required parameters (uid, lat, lon) are missing");
      }

      String pinID = UUID.randomUUID().toString();


      Map<String, Object> pinData = new HashMap<>();
      pinData.put("user", uid);
      pinData.put("coordinates", Map.of("lat", lat, "long", lon));
      pinData.put("pinID", pinID);

      this.storageHandler.addDocument(uid, "pins", pinID, pinData);

      String allPinsDocID = UUID.randomUUID().toString();
      this.storageHandler.addDocument("all_users", "pins", allPinsDocID, pinData);

      List<Map<String ,Object>> allPins = this.storageHandler.getCollection("all_users", "pins");

      if (allPins == null) {
        allPins = new ArrayList<>();
      }

      allPins.add(pinData);

      responseMap.put("response_type", "success");
      responseMap.put("pins", allPins);

      System.out.println("All Pins List: " + allPins);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "error");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);

  }
}