package edu.brown.cs.student.main.server.handlers.Users;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class ClearUserHandler implements Route {

  public StorageInterface storageHandler;

  public ClearUserHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /**
   * Invoked when a request is made on this route's corresponding path e.g. '/hello'
   *
   * @param request The request object providing information about the HTTP request
   * @param response The response object providing functionality for modifying the response
   * @return The content to be set in the response
   */
  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");
      if (uid == null || uid.isEmpty()) {
        throw new IllegalArgumentException("User ID (uid) is required");
      }
      Firestore db = FirestoreClient.getFirestore();
      System.out.println("clearing pins for user: " + uid);
      List<Map<String, Object>> allPins = storageHandler.getCollection("all_users", "pins");
      List<Map<String, Object>> remainingPins = new ArrayList<>();

      for (Map<String, Object> pin : allPins) {
        if (pin.get("user") != null && pin.get("user").equals(uid)) {
          String docID = (String) pin.get("pinID");
          if (docID != null) {
            DocumentReference docRef =
                db.collection("all_users").document("pins").collection("pins").document(docID);

            docRef.delete().get();
            System.out.println("Deleted document with ID: " + docID);
          }
        } else { // Add non-deleted pins to the list of remaining pins remaining
          remainingPins.add(pin);
        }
      }
      responseMap.put("response_type", "success");
      responseMap.put("remaining_pins", remainingPins);

      // Include remaining pins
    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "error");
      responseMap.put("error", e.getMessage());
    }
    return Utils.toMoshiJson(responseMap);
  }
}
