package edu.brown.cs.student.main.server.handlers;

import java.util.Arrays;
import java.util.List;

public class MockEventService {

  // method to
  // date time object
  public List<Event> getEventObjects() {
    return Arrays.asList(new Event("0", "AMP String Performance", "Lindenmann", "11-20-2024", "11-20-2024", "End of semester recital", "Artistic", "7:00 pm","9:00 pm" ),
        new Event("1", "Waterfire", "Downtown Providence", "11-20-2024", "11-20-2024", "waterfire lighting", "Artistic", "5:00 pm", "7:00 pm") );
  }

}
