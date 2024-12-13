package edu.brown.cs.student.main.server;

import static spark.Spark.after;

import edu.brown.cs.student.main.server.handlers.EventHandler;
import edu.brown.cs.student.main.server.handlers.MockEventService;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import spark.Filter;
import spark.Spark;

/** Top Level class for our project, utilizes spark to create and maintain our server. */
public class Server {

  public static void setUpServer() {
    int port = 3232;
    Spark.port(port);

    after(
        (Filter)
            (request, response) -> {
              response.header("Access-Control-Allow-Origin", "*");
              response.header("Access-Control-Allow-Methods", "*");
            });

    MockEventService mockEventService;

    StorageInterface firebaseUtils;
    try {
      mockEventService = new MockEventService();
      //   firebaseUtils = new FirebaseUtilities();

      // Spark.get("add-word", new AddWordHandler(firebaseUtils));
      // Spark.get("list-words", new ListWordsHandler(firebaseUtils));
      // Spark.get("clear-user", new ClearUserHandler(firebaseUtils));
      Spark.get("events", new EventHandler(mockEventService));

      Spark.notFound(
          (request, response) -> {
            response.status(404); // Not Found
            System.out.println("ERROR");
            return "404 Not Found - The requested endpoint does not exist.";
          });
      Spark.init();
      Spark.awaitInitialization();

      System.out.println("Server started at http://localhost:" + port);
    } catch (Exception e) {
      e.printStackTrace();
      System.err.println(
          "Error: Could not initialize Firebase. Likely due to firebase_config.json not being found. Exiting.");
      System.exit(1);
    }
  }

  /**
   * Runs Server.
   *
   * @param args none
   */
  public static void main(String[] args) {
    setUpServer();
  }
}
