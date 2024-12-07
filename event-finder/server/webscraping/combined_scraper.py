from bs4 import BeautifulSoup
from requests import get
from collections import Counter
import requests
import time
import pickle
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from tqdm import tqdm

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

brown_url = "https://events.brown.edu/event/"

@dataclass
class Location:
    name: str
    lat: Optional[float] = None
    long: Optional[float] = None
    url: Optional[str] = None
    address: Optional[str] = None

@dataclass
class Event:
    title: str
    location: Location
    date_str: Optional[str] = None
    time: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    img_url: Optional[str] = None
    event_id: Optional[str] = None
    description_html: Optional[str] = None
    is_paid: bool = False
    is_brown: bool = False

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in headless mode
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)

def driver_helper(url: str, wait_class_name: str, is_brown: bool):
    driver = get_driver()
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, wait_class_name))
        )
    except Exception as e:
        print(f"Exception while waiting for page elements: {e}")
        driver.quit()
        return None, is_brown
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()
    return soup, is_brown

def get_event_title(event, is_brown: bool) -> str:
    if is_brown: 
        event_title = event.find("div", class_="lw_events_title")
        if event_title:
            return event_title.get_text(strip=True)
        return "No Event Name"
    return ""
    
def get_event_time(event, is_brown: bool) -> str:
    if is_brown:
        start_time = event.find("span", class_="lw_start_time").get_text(strip=True)
        end_time = event.find("span", class_="lw_end_time").get_text(strip=True)
        timezone = event.find("span", class_="lw_cal_tz_abbrv").get_text(strip=True)
        return f"{start_time} - {end_time} {timezone}"
    return None

def get_location(event, is_brown: bool) -> Location:
    if is_brown:
        virtual_checker = event.find("section", class_="lw_events_online")
        physical_checker = event.find("a", class_="lw_cal_location_link")
        
        if physical_checker and not virtual_checker:
            location_name = physical_checker.get_text(strip=True)
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            return Location(name=location_name, lat=latitude, long=longitude)

        if virtual_checker and not physical_checker:
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints
            return Location(name="virtual", url=event_url)
        
        if physical_checker and virtual_checker:
            location_name = f"{physical_checker.get_text(strip=True)} Virtual"
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints
            return Location(name=location_name, lat=latitude, long=longitude, url=event_url)
    
    return Location(name="Location not specified")

def get_more_info(url: str) -> tuple[str, str]:
    """Fetch additional event information from Eventbrite event page"""
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    address = ""
    description = ""
    
    try:
        address_div = soup.find('div', class_='location-info__address')
        if address_div and len(address_div.contents) > 1:
            address = address_div.contents[1].strip()
    except Exception as e:
        print(f"Error fetching address: {e}")
    
    try:
        description_div = soup.select('#event-description')
        if description_div:
            description = str(description_div[0])
    except Exception as e:
        print(f"Error fetching description: {e}")
    
    return address, description

def scrape_brown_events() -> list[Event]:
    #Fetches events from Events@Brown and parses them
    url = "https://events.brown.edu/all"
    wait_class_name = "lw_cal_event_list"
    is_brown = True

    soup, is_brown = driver_helper(url, wait_class_name, is_brown)
    if not soup:
        return []

    events = []
    event_items = soup.find_all("div", class_="lw_cal_event_list")
    
    for item in event_items:
        title = get_event_title(item, is_brown)
        time = get_event_time(item, is_brown)
        location = get_location(item, is_brown)
        event = Event(
            title=title,
            date_str=None,  # TODO: Extract date from Brown events
            time=time,
            location=location,
            price=None,
            img_url=None,
            event_id=None,
            is_brown=True
        )
        events.append(event)

    return events

def scrape_eventbrite_events(num_pages: int = 5) -> list[Event]:
    #Fetches events from Providence EventBrite and parses them
    url = "https://www.eventbrite.com/d/ri--providence/all-events/"
    events = []
    ids = set()

    for page_i in range(1, num_pages + 1):
        r = requests.get(url, params={'page': page_i})
        soup = BeautifulSoup(r.text, 'html.parser')

        sections = soup.find_all('section', class_='event-card-details')
        for section in tqdm(sections, desc=f'Parsing page {page_i}'):
            a = section.a
            if not a:
                continue

            event_id = a.get('data-event-id')
            if not event_id or event_id in ids:
                continue
                
            ids.add(event_id)
            image = section.parent.find('img', class_='event-card-image')
            inner_url = a['href']

            try:
                address, description = get_more_info(inner_url)
            except Exception as e:
                print(f"Error fetching additional info for event {event_id}: {e}")
                address, description = "", ""

            location = Location(
                name=a.get('data-event-location', 'No location specified'),
                address=address
            )
            
            events.append(Event(
                title=a.get('aria-label', 'No title'),
                category=a.get('data-event-category'),
                location=location,
                is_paid=a.get('data-event-paid-status') == 'paid',
                date_str=section.p.text if section.p else None,
                img_url=image['src'] if image is not None else None,
                event_id=event_id,
                description_html=description
            ))

    return events

def save_events(events: list[Event], filename: str = 'events.pkl'):
    """Save events to a pickle file"""
    with open(filename, 'wb') as out:
        pickle.dump(events, out)

def load_events(filename: str = 'events.pkl') -> list[Event]:
    """Load events from a pickle file"""
    with open(filename, 'rb') as inp:
        return pickle.load(inp)

if __name__ == "__main__":
    # Scrape both sources
    brown_events = scrape_brown_events()
    eventbrite_events = scrape_eventbrite_events(num_pages=2)
    
    # Combine all events
    all_events = brown_events + eventbrite_events
    
    # Save to file
    save_events(all_events)
    
    print(f"Scraped {len(brown_events)} Brown events and {len(eventbrite_events)} Eventbrite events")