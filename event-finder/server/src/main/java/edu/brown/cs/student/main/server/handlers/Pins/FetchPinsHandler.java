package edu.brown.cs.student.main.server.handlers.Pins;

import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class FetchPinsHandler implements Route {

  public StorageInterface storageHandler;

  public FetchPinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /*
   * Invoked when a request is made ont his route's corresponding path e.g. 'pins'
   *
   * @param request - The request object providing information about HTTP request
   * @param response - Response map garnered from querying the API
   * @return
   * @throws Exception
   */
  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      System.out.println("Listing all pins");
      List<Map<String, Object>> vals = this.storageHandler.getCollection("all_users", "pins");

      if (vals == null) {
        responseMap.put("respose_type", "failure");
        responseMap.put("error", "No pins found");
        return Utils.toMoshiJson(responseMap);
      }

      List<Map<String, Object>> pins = new ArrayList<>();
      for (Map<String, Object> pin : vals) {
        Map<String, Object> pinData = new HashMap<>();
        pinData.put("user", pin.get("user").toString());
        pinData.put("coordinates", pin.get("coordinates"));

        pins.add(pinData);
      }

      responseMap.put("response_type", "success");
      responseMap.put("pins", pins);

    } catch (Exception e) {
      e.printStackTrace();
      ;
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    System.out.println("Pins to Return: " + responseMap);
    return Utils.toMoshiJson(responseMap);
  }
}
