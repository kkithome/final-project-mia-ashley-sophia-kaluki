package edu.brown.cs.student.main.server.handlers.Events;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import com.squareup.moshi.Types;
import edu.brown.cs.student.main.server.Objects.Event;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

public class ScraperUtility {
  private static final String scraper_path = "webscraping/combined_scraper.py";
  private static final String env_path =
      "/Users/kkithome/Desktop/csci 0320/final/final-project-mia-ashley-sophia-kaluki/"
          + "event-finder/bin/python";

  public static List<Event> scrapeData(String source) throws IOException, InterruptedException {
    String[] command = {env_path, scraper_path, source};

    ProcessBuilder processBuilder = new ProcessBuilder(command);
    processBuilder.redirectErrorStream(true);
    Process process = processBuilder.start();

    BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
    StringBuilder output = new StringBuilder();
    String line;

    while ((line = reader.readLine()) != null) {
      output.append(line);
    }

    int exitCode = process.waitFor();
    if (exitCode == 0) {
      System.out.println("Raw scraper output: " + output);
      return parseJsonToEvents(output.toString());
    } else {
      System.out.println("Raw scraper output: " + output);
      throw new IOException("Error occurred while scraping. Exit code: " + exitCode);
    }
  }

  private static List<Event> parseJsonToEvents(String json) throws IOException {
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<List<Event>> jsonAdapter =
        moshi.adapter(Types.newParameterizedType(List.class, Event.class));
    return jsonAdapter.fromJson(String.valueOf(json));
  }
}
