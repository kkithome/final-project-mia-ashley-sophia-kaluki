package edu.brown.cs.student.main.server.storage;

import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class FirebaseUtilities implements StorageInterface {

  public FirebaseUtilities() throws IOException {
    String workingDirectory = System.getProperty("user.dir");
    Path firebaseConfigPath =
        Paths.get(workingDirectory, "src", "main", "resources", "firebase_config.json");
    FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath.toString());

    FirebaseOptions options =
        new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();

    FirebaseApp.initializeApp(options);
  }

  @Override
  public List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException, IllegalArgumentException {
    if (uid == null || collection_id == null) {
      throw new IllegalArgumentException("getCollection: uid and/or collection_id cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
    CollectionReference dataRef =
        db.collection("activities").document(uid).collection(collection_id);

    QuerySnapshot dataQuery = dataRef.get().get();

    List<Map<String, Object>> data = new ArrayList<>();
    for (QueryDocumentSnapshot doc : dataQuery.getDocuments()) {
      data.add(doc.getData());
    }

    return data;
  }

  public DocumentReference getDocumentReference(String uid, String collection_id, String doc_id) throws
      ExecutionException, InterruptedException {
    Firestore db = FirestoreClient.getFirestore();
    return db.collection(collection_id).document(doc_id);
  }

  public boolean docExists(String uid, String collection_id, String doc_id) throws ExecutionException,
      InterruptedException {
    DocumentReference docRef = getDocumentReference(uid, collection_id, doc_id);
    return docRef.get().get().exists();

  }

  @Override
  public void addDocument(
      String uid, String collection_id, String doc_id, Map<String, Object> data)
      throws IllegalArgumentException {
    if (uid == null || collection_id == null || doc_id == null || data == null) {
      throw new IllegalArgumentException(
          "addDocument: activity_id, collection_id, doc_id, or data cannot be null");
    }

    Firestore db = FirestoreClient.getFirestore();
  }

  @Override
  public void clearUser(String uid) throws IllegalArgumentException {
    if (uid == null) {
      throw new IllegalArgumentException("removeUser: uid cannot be null");
    }
    try {
      Firestore db = FirestoreClient.getFirestore();
      DocumentReference userDoc = db.collection("activities").document(uid);
      deleteDocument(userDoc);
    } catch (Exception e) {
      System.err.println("Error removing user : " + uid);
      System.err.println(e.getMessage());
    }
  }

  private void deleteDocument(DocumentReference doc) {
    Iterable<CollectionReference> collections = doc.listCollections();
    for (CollectionReference collection : collections) {
      deleteCollection(collection);
    }
    doc.delete();
  }

  private void deleteCollection(CollectionReference collection) {
    try {

      ApiFuture<QuerySnapshot> future = collection.get();
      List<QueryDocumentSnapshot> documents = future.get().getDocuments();

      for (QueryDocumentSnapshot doc : documents) {
        doc.getReference().delete();
      }
    } catch (Exception e) {
      System.err.println("Error deleting collection : " + e.getMessage());
    }
  }
}
