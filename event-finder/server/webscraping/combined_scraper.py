from bs4 import BeautifulSoup
from requests import get
from collections import Counter
import requests
import time
from enum import Enum
import json
import sys

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

class Source(Enum):
    BROWN = 1
    EVENTBRITE = 2
    GO_PVD = 3

class Location:
    def __init__(self, name, lat=None, long=None, url=None):
        self.name = name
        self.lat = lat
        self.long = long
        self.url = url
    
    def to_json(self):
        return {
            "name": self.name,
            "latitude": self.lat,
            "longitude": self.long,
            "url": self.url
        }

class Event:
    def __init__(self, source: Source, id: int, title: str, description: str, image: str, 
                 date: str, time: str, attendees: int, location: Location, 
                 category: str = None, paid: bool = False):
        self.source = source
        self.id = id
        self.title = title
        self.description = description
        self.image = image
        self.date = date
        self.time = time
        self.attendees = attendees
        self.location = location
        self.category = category
        self.paid = paid
    
    def to_json(self):
        return {
            "source": self.source.name,
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image": self.image,
            "date": self.date,
            "time": self.time,
            "attendees": self.attendees,
            "location": self.location.to_json() if self.location else None,
            "category": self.category,
            "paid": self.paid
        }
class Description_and_Date:
    def __init__(self, description, date):
        self.description = description
        self.date = date

brown_url = "https://events.brown.edu/event/"

def get_driver():
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def driver_helper(url, wait_class_name, source:Source):
    driver = get_driver()
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, wait_class_name))
        )
            # Scroll down to load all events (if infinite scrolling is used)
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            WebDriverWait(driver, 10)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    except Exception as e:
        print("Exception while waiting for page elements:", e)

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    return soup


def scrape_events(source: Source):
    """
    Fetches events from the source (Events@Brown, EventBrite, or Go Providence)
    and parses them into an instance of the Activity class
    """

    
    if source == Source.BROWN:
        url = "https://events.brown.edu/all"
        wait_class_name = "lw_cal_event_list"

    soup = driver_helper(url, wait_class_name, source)

    events = []
    
    #event_containers = soup.find_all("div", class_="lw_cal_event_list")
    #or event_list in event_containers:
    event_items = soup.find_all("div", class_= "lw_cal_event")
    for item in event_items:
        source = source
        id = len(events) + 1 # applicable for any scraping
        title = get_event_title(item, source) # done for Brown
        description = get_event_description_and_date(item, source).description
        image = get_image(item, source)
        date = get_event_description_and_date(item, source).date
        time = get_event_time(item, source)
        attendees = 0
        location = get_location(item, source)
        event = Event(source, id, title, description, image, date, time,
                      attendees, location)
        
        events.append(event)

    return events


def scrape_eventbrite_events():
    # Fetches events from Providence EventBrite and parses them 
    url = "https://www.eventbrite.com/d/ri--providence/all-events/"
    events = []
    ids = set()
    
    
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        sections = soup.find_all('section', class_='event-card-details')
        for section in sections:
            a = section.a
            if not a:
                continue
                
            event_id = a.get('data-event-id')
            if not event_id or event_id in ids:
                continue
                
            ids.add(event_id)
            
            # Retrieves event details
            title = a.get('aria-label', 'No title')
            category = a.get('data-event-category')
            location_name = a.get('data-event-location', 'Location not specified')
            paid = a.get('data-event-paid-status') == 'paid'
            date_str = section.p.text if section.p else None
            
            # Get image
            image = section.parent.find('img', class_='event-card-image')
            img_url = image['src'] if image is not None else "No Image to Display"
            
            # Create Location object
            location = Location(name=location_name)
            
            # Create Event object
            event = Event(
                source=Source.EVENTBRITE,
                id=len(events) + 1,
                title=title,
                description="",  # We could fetch this from the event page if needed
                image=img_url,
                date=date_str,
                time=None,  # Could be extracted from date_str if needed
                attendees=0,
                location=location,
                category=category,
                paid=paid
            )
            
            events.append(event)
            
    except Exception as e:
        print(f"Error scraping Eventbrite events: {e}")
    
    return events

def get_event_title(event, source: Source) -> str:
    if source == Source.BROWN: 
        event_title = event.find("div", class_="lw_events_title")
        if event_title:
            return event_title.get_text(strip=True)
        return "No Event Name"
    elif source == Source.EVENTBRITE:
        a = event.find("a")
        if a:
            return a.get('aria-label', 'No title')
    return "No Event Name"

def get_event_description_and_date(event, source: Source) -> Description_and_Date:
    """
    Parses every event and goes to the specicific event url and parses the 
    first sentence of the description.
    """
    if source == Source.BROWN:
        event_url = event.find("a")["href"]
        full_url = "https://events.brown.edu" + event_url  # Make the URL absolute

        driver = get_driver()
        try: 
         driver.get(full_url)
        except WebDriverException as e:
            print(f"Failed to navigate to {full_url}: {e}")
            return Description_and_Date("No description available", "No date available")


    
        try:
            WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "lw_calendar_event_description"))
        )
        except TimeoutException:
            print(f"Timeout Description not found for event at {full_url}")
            return Description_and_Date("No description available", "No date available")


        soup = BeautifulSoup(driver.page_source, 'html.parser')
    
        description_tag = soup.find("div", class_="lw_calendar_event_description")
        description_content = "No description available"
        if description_tag:
            description_text = description_tag.get_text(strip=True)
            if len(description_text) >= 1: 
                description_content = (
                    description_text.replace("Ph.D", "PhD").split(
                    ".")[0] + "." if description_text else "No description available"
                )
          
        date_tag = soup.find("h5", id="lw_cal_this_day")
        event_date = "Date Not Found; Please Visit: " + event_url
        if date_tag: 
            date_text = "".join([part.strip() for part in date_tag.stripped_strings])
            event_date = date_text

        return Description_and_Date(description_content, date_text)
        
        


def get_event_time(event, source: Source) -> str:
    if source == Source.BROWN:
        time_tag = event.find("span", class_="lw_start_time")
        end_time_tag = event.find("span", class_="lw_end_time")
        if time_tag and end_time_tag:
            start_time = time_tag.get_text(strip=True)
            end_time = end_time_tag.get_text(strip=True)
            return f"{start_time} - {end_time}"
    elif source == Source.EVENTBRITE:
        # Time is typically included in the date string for Eventbrite
        return None
    return None

def get_location(event, source: Source) -> Location:

    if source == Source.BROWN:
        virtual_checker = event.find("section", class_="lw_events_online")
        physical_checker = event.find("a", class_="lw_cal_location_link")
        
        if physical_checker and not virtual_checker:
            location_name = physical_checker.get_text(strip=True)
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            return Location(location_name, latitude, longitude)
            
        if virtual_checker and not physical_checker:
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints
            return Location("virtual", None, None, event_url)
            
        if physical_checker and virtual_checker:
            location_name = f"{physical_checker.get_text(strip=True)} Virtual"
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints
            return Location(location_name, latitude, longitude, event_url)
            
    elif source == Source.EVENTBRITE:
        a = event.find("a")
        if a:
            location_name = a.get('data-event-location', 'Location not specified')
            return Location(location_name)
    
    return Location("Location not specified")

def get_image(event, source: Source) -> str:
    if source == Source.BROWN:
        image_tag = event.find("div", class_="lw_item_thumb")
        if image_tag:
            img_tag = image_tag.find("img")
            if img_tag:
                return img_tag['src']
    elif source == Source.EVENTBRITE:
        image = event.parent.find('img', class_='event-card-image')
        if image:
            return image['src']
    return "No Image to Display"

def save_events_json(events, filename='events.json'):
    """Save events to a JSON file"""
    with open(filename, 'w') as f:
        json.dump([e.to_json() for e in events], f, indent=2)


scrape_events(Source.BROWN)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"result": "error", "error": "Source parameter is required"}))
        sys.exit(1)
    
    source = sys.argv[1]

    print(f"Scraped Data Loading . . .")

    try:
        if source.lower() == "brown":
            brown_events = scrape_events(Source.BROWN)
            save_events_json(brown_events)


        elif source.lower() == "eventbrite":
            eventbrite_events = scrape_eventbrite_events()
            save_events_json(eventbrite_events)

    except Exception as e:
        print(json.dumps({"result": "error","error": str(e)}))
        sys.exit(1)



if __name__ == "__main__":
    main()