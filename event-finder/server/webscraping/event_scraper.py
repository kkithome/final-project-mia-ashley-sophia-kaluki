# from bs4 import BeautifulSoup
# from requests import get
# from collections import Counter
# import requests
# import time
# from enum import Enum

# # Selenium imports
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.common.exceptions import NoSuchElementException
# from selenium.common.exceptions import StaleElementReferenceException
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.chrome.service import Service as ChromeService
# from webdriver_manager.chrome import ChromeDriverManager

# """
# IMPORTANT:

# To make this work a few installations and other things must be set up:
# 1. Check Your Python Version: 
#     - run: python3 --version
# 2. Create and Activate a Virtual Environment
#     - run python3 -m venv event-finder
#     - run source venv/bin/activate

# 3. Install the needed dependencies:
#     - pip3 install -r requirements.txt


# """

# """
# TODO: 
# - write get_driver() class

# - set up and Event and Location class

# - write getters for each field in each class

# - write a get_events class that uses the get_driver function (have it take in a for_brown boolean)

# - write a scrape_data function that takes in a soup object, (from the get_events function) and 
# uses the various getters to create an Event object and add it to the event dictionary for later use

# """

# brown_url = "https://events.brown.edu/event/"

# def get_driver():
#     service = ChromeService(ChromeDriverManager().install())
#     return webdriver.Chrome(service=service)

# class Source(Enum):
#     BROWN = 1
#     EVENTBRITE = 2
#     GO_PVD = 3


# class Location:
#     def __init__(self, name, lat:None, long:None, url:None):
#         self.name = name
#         self.lat = lat
#         self.long = long
#         self.url = url


# class Event:
#     def __init__(self, source: Source, id: int, title: str, description: str, image: str, 
#                  date: None, time: str, attendees: int, location: Location):
#         self.source = source
#         self.id = id
#         self.title = title
#         self.description = description
#         self.image = image
#         self.date = date
#         self.time = time
#         self.attendees = attendees
#         self.location = location

# class Description_and_Date:
#     def __init__(self, description, date):
#         self.description = description
#         self.date = date
        



# def driver_helper(url, wait_class_name, source:Source):
#     driver = get_driver()
#     driver.get(url)
#     try:
#         WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.CLASS_NAME, wait_class_name))
#         )
#             # Scroll down to load all events (if infinite scrolling is used)
#         last_height = driver.execute_script("return document.body.scrollHeight")
#         while True:
#             driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
#             WebDriverWait(driver, 3)
#             new_height = driver.execute_script("return document.body.scrollHeight")
#             if new_height == last_height:
#                 break
#             last_height = new_height

#     except Exception as e:
#         print("Exception while waiting for page elements:", e)

#     soup = BeautifulSoup(driver.page_source, 'html.parser')
#     driver.quit()

#     return soup


# def scrape_events(source: Source):
#     """
#     Fetches events from the source (Events@Brown, EventBrite, or Go Providence)
#     and parses them into an instance of the Activity class
#     """
    
#     if source == Source.BROWN:
#         url = "https://events.brown.edu/all"
#         wait_class_name = "lw_cal_event_list"

#     elif source == Source.EVENTBRITE: 
#         url = "https://www.eventbrite.com/d/ri--providence/events/"
#         wait_class_name = "search-event-card-wrapper"

#     elif source == Source.GO_PVD:
#         url = "https://www.goprovidence.com/events/?bounds=false&view=list&sort=date#listings"
#         wait_class_name = "content_list"
#     soup = driver_helper(url, wait_class_name, source)

#     events = []
    
#     event_containers = soup.find_all("div", class_="lw_cal_event_list")

#     for event_list in event_containers:
#         event_items = event_list.find_all("div", class_= "lw_cal_event")


#     for item in event_items:
#         source = source
#         id = len(events) + 1 # applicable for any scraping
#         title = get_event_title(item, source) # done for Brown
#         description = get_event_description_and_date(item, source).description
#         image = get_image(item, source)
#         date = get_event_description_and_date(item, source).date
#         time = get_event_time(item, source)
#         attendees = 0
#         location = get_location(item, source)
#         event = Event(source, id, title, description, image, date, time, 
#                       attendees, location)
#         events.append(event)

#     return events


# def get_event_title(event, source: Source) -> str:
#     """
#     Uses the isBrown boolean to determine which scapring method to use, from there
#     it scrapes the event title
#     """
#     if source == Source.BROWN: 
#             event_title = event.find("div", class_="lw_events_title")
#             if event_title:
#                 event_name = event_title.get_text(strip=True)
#                 return event_name
#             else: 
#                 return "No Event Name"
#     else:
#         event_title = ""
#         return "Need to write scraping for EventBrite"
    
# def get_event_description_and_date(event, source: Source) -> Description_and_Date:
#     """
#     Parses every event and goes to the specicific event url and parses the 
#     first sentence of the description.
#     """
#     if source == Source.BROWN:
#         event_url = event.find("a")["href"]
#         full_url = "https://events.brown.edu" + event_url  # Make the URL absolute

#         driver = get_driver()
#         driver.get(full_url)
    
#         WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.CLASS_NAME, "lw_calendar_event_description"))
#         )

#         soup = BeautifulSoup(driver.page_source, 'html.parser')
    
#         description_tag = soup.find("div", class_="lw_calendar_event_description")
#         if description_tag:
#             description_text = description_tag.get_text(strip=True)
#             if len(description_text) >= 1: 
#                 first_sentence = description_text.replace("Ph.D", "PhD").split(
#                     ".")[0] + "." if description_text else "No description available."
          
#         date_tag = soup.find("h5", id="lw_cal_this_day")
#         event_date = "Date Not Found; Please Visit: " + event_url
#         if date_tag: 
#             date_text = "".join([part.strip() for part in date_tag.stripped_strings])
#             event_date = date_text

#         return Description_and_Date(first_sentence, date_text)
        

        
           
    
# def get_event_time(event, source: Source) -> str:
#     """ 
#     Takes in a singular event and scrapes for the time.
#     """
#     if source == Source.BROWN:
#         time_tag = event.find("span", class_="lw_start_time")
#         end_time_tag = event.find("span", class_="lw_end_time")
#         if time_tag and end_time_tag:
#             start_time = time_tag.get_text(strip=True) if time_tag else "No Start Time"
#             end_time = end_time_tag.get_text(strip=True) if end_time_tag else "No End Time"
#             return f"{start_time} - {end_time}"
    
    
# def get_location(event, source: Source) -> Location:
#     """ 
#     Takes in a singular event, scrapes for the location and returns a Location 
#     object with:
#         - For In Person Events:
#             - Location Title, 
#             - Latitude
#             - Longitude

#         - For Virtual Events:
#             - A URL To the Original Link
#     """
#     if source == Source.BROWN:
#         virtual_checker = event.find("section", class_="lw_events_online")
#         physical_checker = event.find("a", class_="lw_cal_location_link")
        
#         if (physical_checker and not virtual_checker):
#             location_name = physical_checker.get_text(strip=True)
#             latitude = physical_checker['data-latitude']
#             longitude = physical_checker['data-longitude']

#             if latitude and longitude:
#                 return Location(location_name, latitude, longitude, None)
#             else:
#                 return Location(location_name, None, None, None)

#         if (virtual_checker and not physical_checker):
#             location_name = "virtual"
#             event_url_endpoints = event.find("a", href=True)
#             event_endpoints = event_url_endpoints['href']
#             event_url = brown_url + event_endpoints
#             return Location(location_name, None, None, event_url)
        
#         if (physical_checker and virtual_checker):
#             location_name = physical_checker.get_text(strip=True) + " Virtual"
#             latitude = physical_checker['data-latitude']
#             longitude = physical_checker['data-longitude']
#             event_url_endpoints = event.find("a", href=True)
#             event_endpoints = event_url_endpoints['href']
#             event_url = brown_url + event_endpoints

#             return Location(location_name, latitude, longitude, event_url)
        
#     elif source == Source.EVENTBRITE:
#         return Location("need to write scraping for EventBrite")
    
# def get_image(event, source: Source) -> str:
#     if source == Source.BROWN:
#         image_tag = event.find("div", class_="lw_item_thumb")

#         if image_tag:
#             img_tag = image_tag.find("img")
#             if img_tag:
#                 return img_tag['src']
            
#         return "No Image to Display"



# scrape_events(Source.BROWN)

    

    


            
        





 





