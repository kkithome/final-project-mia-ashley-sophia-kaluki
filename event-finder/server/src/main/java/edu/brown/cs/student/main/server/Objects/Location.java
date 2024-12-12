package edu.brown.cs.student.main.server.Objects;

public class Location {
  private String name;
  private String latitude;
  private String longitude;
  private String url;

  public Location(String name, String latitude, String longitude, String url) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.url = url;
  }

  public String getName() {
    return this.name;
  }

  public String getLatitude() {
    return this.latitude;
  }

  public String getLongitude() {
    return this.longitude;
  }

  public String getUrl() {
    return this.url;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setLatitude(String latitude) {
    this.latitude = latitude;
  }

  public void setLongitude(String longitude) {
    this.longitude = longitude;
  }

  public void setUrl(String url) {
    this.url = url;
  }
}
