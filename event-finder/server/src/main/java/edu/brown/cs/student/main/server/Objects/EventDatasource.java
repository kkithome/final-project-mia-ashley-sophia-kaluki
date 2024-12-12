package edu.brown.cs.student.main.server.Objects;

import java.util.List;

public interface EventDatasource {
  List<Event> getEvents(String source);
}
