package edu.brown.cs.student.main.server.handlers;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class EventbriteClient {

  // API key
  private static final String EVENTBRITE_API_KEY = "LOG6Z4XEAJDYV4RNP2Z6";

  /**
   * This is a helper method to open the HTTP connection for the given URL.
   *
   * @param url the URL to connect
   * @return the established HttpURLConnection
   * @throws IOException if an I/O error
   */
  private HttpURLConnection connect(URL url) throws IOException {
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");
    return connection;
  }
}
