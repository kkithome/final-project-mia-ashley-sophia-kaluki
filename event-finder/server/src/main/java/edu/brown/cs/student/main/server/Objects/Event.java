package edu.brown.cs.student.main.server.Objects;

import com.squareup.moshi.Json;
import java.util.List;

public class Event {

  @Json(name = "source")
  private String source;
  @Json(name = "id")
  private String id;

  @Json(name = "title")
  private String title;

  @Json(name = "description")
  private String description;

  @Json(name = "image")
  private String image;

  @Json(name = "date")
  private String date;

  @Json(name = "start_time")
  private String start_time;

  @Json(name = "end_time")
  private String end_time;

  @Json(name = "attendance")
  private int attendance;

  @Json(name = "attendees")
  private List attendees;

  @Json(name = "location")
  private Location location;

  @Json(name = "category")
  private String category;

  @Json(name = "onCampus")
  private boolean onCampus;

  public Event(
      String source,
      String id,
      String title,
      String description,
      String image,
      String date,
      String start_time,
      String end_time,
      int attendance,
      List attendees,
      Location location,
      String category,
      boolean onCampus) {
    this.source = source;
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
    this.date = date;
    this.start_time = start_time;
    this.end_time = end_time;
    this.attendees = attendees;
    this.location = location;
    this.category = category;
    this.onCampus = onCampus;
  }
  public String getSource() { return this.source;}

  public String getId() {
    return this.id;
  }

  public String getTitle() {
    return this.title;
  }

  public String getDescription() {
    return this.description;
  }

  public String getImage() {
    return this.image;
  }

  public String getDate() {
    return this.date;
  }

  public String getStart_time() {
    return this.start_time;
  }

  public String getEnd_time() {
    return this.end_time;
  }

  public int getAttendance() {
    return this.attendance;
  }

  public List getAttendees() {
    return this.attendees;
  }

  public Location getLocation() {
    return this.location;
  }

  public String getCategory() {
    return this.category;
  }

  public boolean getOnCampus() {
    return this.onCampus;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setTitle(java.lang.String title) {
    this.title = title;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public void setImage(String image) {
    this.image = image;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public void setStart_time(String start_time) {
    this.start_time = start_time;
  }

  public void setEnd_time(String end_time) {
    this.end_time = end_time;
  }

  public void setAttendees(List attendees) {
    this.attendees = attendees;
  }

  public void setAttendance(int attendance) {
    this.attendance = attendance;
  }

  public void setLocation(Location location) {
    this.location = location;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public void setOnCampus(boolean onCampus) {
    this.onCampus = onCampus;
  }
}
