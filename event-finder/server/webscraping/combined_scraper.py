from bs4 import BeautifulSoup
from requests import get
from collections import Counter
import requests
from datetime import datetime
import time
import random
from enum import Enum
import json
import sys


# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
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
    """ 
    Location class meant to hold either the physical, virtual or hybrid
    location infortmation for an event

    """
    def __init__(self, name, lat=None, long=None, address=None):
        self.name = name
        self.lat = lat
        self.long = long
        self.address = address
    
    def to_json(self):
        return {
            "name": self.name,
            "latitude": self.lat,
            "longitude": self.long,
            "address": self.address }

class Event:
    """
    Definition of event class, this class will be used to store event data
    when scraped from the sources as well as parse the events in the backend for 
    Firestore storage

    Includes the class definition as well as a to_json to make displaying it on the server
    and parsing it easier
    """
    def __init__(self, source: Source, id: int, title: str, description: str, image: str, 
                 date: str, start_time: str, end_time: str, attendance: int, attendees: list[str], location: Location, 
                 category: str = None, onCampus: bool = False):
        self.source = source
        self.id = id
        self.title = title
        self.description = description
        self.image = image
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.attendance = attendance
        self.attendees = attendees
        self.location = location
        self.category = category
        self.onCampus = onCampus
    
    def to_json(self):
        return {
            "source": self.source.name,
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image": self.image,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "attendance": self.attendance,
            "attendees": self.attendees,
            "location": self.location.to_json() if self.location else None,
            "category": self.category,
            "onCampus": self.onCampus
        }
class Description_and_Date:
    """
    On the Events@Brown page, the description and date are stored under the same
    header so we created this class to make the scraping of this data easier. 
    This is exclusive to scraping brown events.
    """
    def __init__(self, description, date):
        self.description = description
        self.date = date

    def to_json(self):
        return {
            "description": self.description,
            "date": self.date
        }

class Time:
    """
   Time class that make the start_time and end_time both easier to parse and 
   store.
    """
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def to_json(self):
        return {
            "start": self.start,
            "end": self.end
        }


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


event_id_map = {}

def generate_event_id(event_id_map):
    """
    Generates a unique event_id for each scraped event regardless of the webpage
    it's scraped from
    """
    while True:
        random_id = random.randint(0, 1000)
        if random_id not in event_id_map:
            return random_id
    

def scrape_events(source: Source):
    """
    Fetches events from the source (Events@Brown) and parses them into an 
    instance of the Event class
    """
    
    if source == Source.BROWN:
      url = "https://events.brown.edu/all"
      wait_class_name = "lw_cal_event_list"

    soup = driver_helper(url, wait_class_name, source)

    events = []
    
    event_containers = soup.find_all("div", class_="lw_cal_event_list")
    ## all od the events are organized by date so this allows us to look into each date
    for event_list in event_containers:
        event_items = soup.find_all("div", class_= "lw_cal_event")

        for item in event_items: # for every event in each date
            source = Source.BROWN
            id = generate_event_id(event_id_map)
            title = get_event_title(item, source) # done for Brown
            description_and_date = get_event_description_and_date(item, source)
            description = description_and_date.description
            image = get_image(item, source)
            date = description_and_date.date
            event_time = get_event_time(item, source)
            if event_time is not None: 
                start_time = event_time.start
                end_time =  event_time.end
            else:
                start_time = "No time data available"
                end_time =  "No time data available"
            attendance = 0
            attendees = []
            location = get_location(item, source)
            category = "Brown event"
            onCampus = True
            event = Event(source, id, title, description, image, date, start_time, 
                        end_time, attendance,attendees, location, category, 
                        onCampus)

            event_id_map[id] = event
            events.append(event)

    return events


def scrape_eventbrite_events():
    """
    Fetches events from Providence EventBrite and parses them into an instance 
    of the Event class
    """
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


            event_url = a.get('href')
            

            if event_url: 
                driver = get_driver()
                try:
                    driver.get(event_url)
                except WebDriverException as e:
                    return "No event specific url"
                try:
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, 
                        "event_details")))
                except TimeoutException:
                    "Issue with getting event_url for Eventbrite"
                    
                soup2 = BeautifulSoup(driver.page_source, 'html.parser')

                og_title = a.get('aria-label', 'No title')
                title = og_title.replace("View", "").replace('\"', '')
                category = a.get('data-event-category')  

                
                address = "No address provided" 

                location_info = soup2.find("p", class_="location-info__address-text")
                location_name = location_info.text.strip() if location_info else "No location information"
                address_info = location_info.next_element.next_element.text.strip() if location_info else "No address information"

                location = Location(name=location_name, address=address_info)

                paid = a.get('data-event-paid-status') == 'paid'


                time_and_date_info= soup2.find("span", class_="date-info__full-datetime")
                date_info="No date information provided"
                time_info="No time information provided"


                if time_and_date_info: 
                    split=time_and_date_info.text.split("·")
                    if len(split) > 1:
                        date_info = split[0]
                        time_info = split[1]
                        
                image = section.parent.find('img', class_='event-card-image')
                img_url = image['src'] if image is not None else "No Image to Display"
            
            # Create Event object
            event = Event(
                source=Source.EVENTBRITE,
                id=generate_event_id(event_id_map),
                title=title,
                description="",
                image=img_url,
                date=date_info,
                start_time=time_info, 
                end_time=None,
                attendance = 0,
                attendees=[],
                location=location,
                category=category,
                onCampus=False
            )
            
            event_id_map[id] = event
            events.append(event)
            
    except Exception as e:
        print(f"Error scraping Eventbrite events: {e}")
    
    return events

def get_event_title(event, source: Source) -> str:
    """
    Extracts the event title from the webpage
    """
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
    Parses every event and goes to the specific event url and parses the 
    first sentence of the description.
    """
    if source == Source.BROWN:
        event_url = event.find("a")["href"]
        full_url = "https://events.brown.edu" + event_url

        driver = get_driver()
        try: 
         driver.get(full_url)
        except WebDriverException as e:
            return Description_and_Date(
                "No description available", "No date available")

        try:
            WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((
                By.CLASS_NAME, "lw_calendar_event_description"))
        )
        except TimeoutException:
            return Description_and_Date(
                "No description available", "No date available")


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
    """
    For Brown events, this function extracts the time information from 
    Event@Brown and creates an instance of the time class.

    Time is often included in the date string for eventbrite so this function 
    is not used for that source.
    """
    if source == Source.BROWN:
        time_tag = event.find("span", class_="lw_start_time")
        end_time_tag = event.find("span", class_="lw_end_time")
        if time_tag and end_time_tag:
            start_time = time_tag.get_text(strip=True)
            end_time = end_time_tag.get_text(strip=True)
            return Time(start_time, end_time)
        else:
            return None
    elif source == Source.EVENTBRITE:
        # Time is typically included in the date string for Eventbrite
        return None
    return None

def get_location(event, source: Source) -> Location:
    """
    Extracts the physical location information, virtual url or a hybrid for 
    each events and creates an instance of the Location class
    """

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
            location_name = a.get('data-event-location', 
                                  'Location not specified')
            return Location(location_name)
    
    return Location("Location not specified")

def get_image(event, source: Source) -> str:
    """
    Extracts the image url from each event
    """
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
    """
    This function allows the scarper to be called within the server.
    
    """

    if len(sys.argv) < 2:
        print(json.dumps({"result": "error", "error": "Source parameter is" + 
                          "required"}))
        sys.exit(1)
    
    source = sys.argv[1]

    try:
        brown_events = scrape_events(Source.BROWN)

        eventbrite_events = scrape_eventbrite_events()
        
        if source.lower() == "brown":
            json_ready = json.dumps([event.to_json() for event in brown_events]
                                    ).encode('utf-8').decode('unicode_escape')
            print(json_ready)
            return json_ready
            

        elif source.lower() == "eventbrite":
            json_ready = json.dumps([event.to_json() for event in 
                                     eventbrite_events]).encode('utf-8').decode(
                                         'unicode_escape')
            print(json_ready)
            return json_ready

        elif source.lower() == "both":
            all_events = json.dumps([event.to_json() for event in brown_events]
            ).encode('utf-8').decode('unicode_escape') + json.dumps([
                event.to_json() for event in eventbrite_events])
            print(all_events)
            return json_ready

        elif ((source.lower() != "brown") or (source.lower() != "eventbrite")):
            print(json.dumps({"result": "error", "error": "Invalid event source: "
                              + "please enter brown or eventbrite"}))
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"result": "error","error": str(e)}))
        sys.exit(1)



if __name__ == "__main__":
    main()
