package edu.brown.cs.student.main.server.handlers;

public class Event {
  private String id;
  private String title;
  private String location;
  private String startDate;
  private String endDate;
  private String description;
  private String eventType;
  private String startTime;
  private String endTime;

  public Event(
      String id,
      String title,
      String location,
      String startDate,
      String endDate,
      String description,
      String eventType,
      String startTime,
      String endTime) {
    this.id = id;
    this.title = title;
    this.location = location;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.eventType = eventType;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  public String getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getLocation() {
    return location;
  }

  public String getStartDate() {
    return startDate;
  }

  public String getEndDate() {
    return endDate;
  }

  public String getdescription() {
    return description;
  }

  public String getEventType() {
    return eventType;
  }

  public String getStartTime() {
    return startTime;
  }

  public String getEndTime() {
    return endTime;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setLocation(String location) {
    this.location = location;
  }
}
