package edu.brown.cs.student.main.server.handlers.Pins;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import edu.brown.cs.student.main.server.Objects.Utils;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import spark.Request;
import spark.Response;
import spark.Route;

public class ClearAllPinsHandler implements Route {

  public StorageInterface storageHandler;

  public ClearAllPinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) throws Exception {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Firestore db = FirestoreClient.getFirestore();

      CollectionReference pinCollection = db.collection("all_users").document(
          "pins").collection("pins");

      ApiFuture<QuerySnapshot> querySnapshot = pinCollection.get();

      querySnapshot.get().getDocuments().forEach(doc -> {
        try {
          doc.getReference().delete().get();

        } catch (ExecutionException | InterruptedException e) {
          throw new RuntimeException(e);
        }
      });



      responseMap.put("response_type", "success");
      responseMap.put("allGone", true);
      responseMap.put("pins", null);
      responseMap.put("message", "All pins have been deleted");

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "error");
      responseMap.put("error", e.getMessage());

    }
    return Utils.toMoshiJson(responseMap);
  }
}
