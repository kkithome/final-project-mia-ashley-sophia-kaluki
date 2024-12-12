package edu.brown.cs.student.main.server.Objects;

public class Event {
  private int id;
  private String title;
  private String description;
  private String image;
  private String date;
  private String time;
  private int attendees;
  private Location location;

  private String category;

  private boolean paid;



  public Event(int id, String title, String description, String image, String date, String time,
      int attendees, Location location, String category, boolean paid) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
    this.date = date;
    this.time = time;
    this.attendees = attendees;
    this.location = location;
    this.category = category;
    this.paid = paid;
  }

  public int getId() {
    return this.id;
  }
  public String getTitle() { return this.title; }
  public String getDescription() { return this.description; }
  public String getImage() { return this.image; }
  public String getDate() { return this.date; }
  public String getTime() { return this.time; }
  public int getAttendees() { return this.attendees; }
  public Location getLocation() { return this.location; }
  public String getCategory() { return this.category; }
  public boolean isPaid() { return this.paid; }




  public void setId(int id) {
    this.id = id;
  }
  public void setTitle(java.lang.String title) {
    this.title = title;
  }
  public void setDescription(String description) { this.description = description; }
  public void setImage(String image) { this.image = image; }
  public void setDate(String date) { this.date = date; }
  public void setTime(String time) { this.time = time; }
  public void setAttendees(int attendees) { this.attendees = attendees; }
  public void setLocation(Location location) { this.location = location; }

  public void setCategory(String category) { this.category = category; }

  public void setPaid(boolean paid) { this.paid = paid; }

}