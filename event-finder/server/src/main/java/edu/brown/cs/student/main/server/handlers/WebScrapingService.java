// package edu.brown.cs.student.main.server.handlers;
// import org.openqa.selenium.By;
// import org.openqa.selenium.WebDriver;
// import org.openqa.selenium.WebElement;
// import org.openqa.selenium.chrome.ChromeDriver;
// import org.springframework.stereotype.Service;
// import io.github.bonigarcia.wdm.WebDriverManager;
//
// import java.util.ArrayList;
// import java.util.List;
//
// public class WebScrapingService {
//  public List<String> scrapeEvents() {
//    WebDriverManager.chromedriver().setup();
//    WebDriver driver = new ChromeDriver();
//    List<String> events = new ArrayList<>();
//
//
//    try {
//      driver.get("https://www.goprovidence.com/events/");
//      List<WebElement> eventElements = driver.findElements(By.cssSelector(".event-title a"));
//
//
//      for (WebElement eventElement : eventElements) {
//        String title = eventElement.getText();
//        String eventUrl = eventElement.getAttribute("href");
//
//
//        events.add("Title: " + title + ", URL: " + eventUrl);
//      }
//
//    } catch (Exception e) {
//      e.printStackTrace();
//    } finally {
//      driver.quit();
//    }
//    return events;
//  }
// }
