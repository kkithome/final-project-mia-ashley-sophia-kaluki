package edu.brown.cs.student.main.server;

import static spark.Spark.after;

import edu.brown.cs.student.main.server.handlers.Events.FetchEventsHandler;
import edu.brown.cs.student.main.server.handlers.Events.ScraperHandler;
import edu.brown.cs.student.main.server.handlers.Pins.ClearAllPinsHandler;
import edu.brown.cs.student.main.server.handlers.Pins.FetchPinsHandler;
import edu.brown.cs.student.main.server.handlers.Pins.SavePinsHandler;
import edu.brown.cs.student.main.server.handlers.Users.ClearUserHandler;
import edu.brown.cs.student.main.server.storage.FirebaseUtilities;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import spark.Filter;
import spark.Spark;

/** Top Level class for our project, utilizes spark to create and maintain our server. */
public class Server {

  public static void setUpServer() {
    int port = 3235;
    Spark.port(port);

    after(
        (Filter)
            (request, response) -> {
              response.header("Access-Control-Allow-Origin", "*");
              response.header("Access-Control-Allow-Methods", "*");
            });

    StorageInterface firebaseUtils;
    try {

      firebaseUtils = new FirebaseUtilities();
      Spark.get("/scrape", new ScraperHandler(firebaseUtils));
      Spark.get("/fetch-events", new FetchEventsHandler(firebaseUtils));

      Spark.get("/fetch-pins", new FetchPinsHandler(firebaseUtils));
      Spark.get("/save-pins", new SavePinsHandler(firebaseUtils));
      Spark.get("/clear-all", new ClearAllPinsHandler(firebaseUtils));


      Spark.get("/clear-user", new ClearUserHandler(firebaseUtils));
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