from bs4 import BeautifulSoup
from requests import get
from collections import Counter
import requests
import time
from enum import Enum
import json

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
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

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in headless mode
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)

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

if __name__ == "__main__":
    # Scrape from both sources
    brown_events = scrape_events(Source.BROWN)
    eventbrite_events = scrape_eventbrite_events()
    
    # Combines all events from both sources 
    all_events = brown_events + eventbrite_events
    
    # Save to JSON file
    save_events_json(all_events)
    
    print(f"Scraped {len(brown_events)} Brown events and {len(eventbrite_events)} Eventbrite events")