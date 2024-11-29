from bs4 import BeautifulSoup
from requests import get
from collections import Counter
from nltk.stem import PorterStemmer
import requests
import time

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

"""
TODO: 
- write get_driver() class

- set up and Event and Location class

- write getters for each field in each class

- write a get_events class that uses the get_driver function (have it take in a for_brown boolean)

- write a scrape_data function that takes in a soup object, (from the get_events function) and 
uses the various getters to create an Event object and add it to the event dictionary for later use

"""

brown_url = "https://events.brown.edu/event/"

def get_driver():
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service)


class Location:
    def __init__(self, name, lat:None, long:None, url:None):
        self.name = name
        self.lat = lat
        self.long = long
        self.url = url


class Event:
    def __init__(self, title, date:None, time, location: Location, price:None):
        self.title = title # brown done
        self.date = date # need to figure for brown
        self.time = time # brown done
        self.location = location # brown done
        self.price = price # N/A for brown


def driver_helper(url, wait_class_name, isBrown):
    driver = get_driver()
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, wait_class_name))
        )
    except Exception as e:
        print("Exception while waiting for page elements:", e)

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    return soup, isBrown


def scrape_brown_events():
    """Fetches events from Events@Brown and parses them"""
    url = "https://events.brown.edu/all"
    wait_class_name = "lw_cal_event_list"
    isBrown = True

    soup, isBrown = driver_helper(url, wait_class_name, isBrown)

    events = []
    
    event_items = soup.find_all("div", class_="lw_cal_event_list")
    for item in event_items:
        title = get_event_title(item, isBrown)
        time = get_event_time(item, isBrown)
        location = get_location(item, isBrown)
        event = Event(title, None, time, location, None)
        events.append(event)

    return events

def scrape_pvd_events():
    """Fetches events from Providence EventBrite and parses them"""
    url = "https://www.eventbrite.com/d/ri--providence/events/"
    wait_class_name = "search-event-card-wrapper"
    isBrown = False
    return driver_helper(url, wait_class_name, isBrown)


def get_event_title(event, isBrown: bool) -> str:
    """
    Uses the isBrown boolean to determine which scapring method to use, from there
    it scrapes the event title
    """
    if isBrown: 
            event_title = event.find("div", class_="lw_events_title")
            if event_title:
                event_name = event_title.get_text(strip=True)
                return event_name
            else: 
                return "No Event Name"
    else:
        event_title = ""
        return "Need to write scraping for EventBrite"
    
def get_event_time(event, isBrown:bool) -> str:
    if isBrown:
        start_time = event.find("span", class_="lw_start_time").get_text(strip=True)
        end_time = event.find("span", class_="lw_end_time").get_text(strip=True)
        timezone = event.find("span", class_="lw_cal_tz_abbrv").get_text(strip=True)
        event_time = start_time + " - " + end_time +" " + timezone
        return event_time
    
def get_location(event, isBrown: bool) -> Location:
    if isBrown:
        virtual_checker = event.find("section", class_="lw_events_online")
        physical_checker = event.find("a", class_="lw_cal_location_link")
        
        if (physical_checker and not virtual_checker):
            location_name = physical_checker.get_text(strip=True)
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            return Location(location_name, latitude, longitude, None)

        if (virtual_checker and not physical_checker):
            location_name = "virtual"
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints
            return Location(location_name, None, None, event_url)
        
        if (physical_checker and virtual_checker):
            location_name = physical_checker.get_text(strip=True) + " Virtual"
            latitude = physical_checker['data-latitude']
            longitude = physical_checker['data-longitude']
            event_url_endpoints = event.find("a", href=True)
            event_endpoints = event_url_endpoints['href']
            event_url = brown_url + event_endpoints

            return Location(location_name, latitude, longitude, event_url)
        
    else:
        return Location("need to write scraping for EventBrite")
    

scrape_brown_events()

    

    



            
        





 





