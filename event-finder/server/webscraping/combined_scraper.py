
# unsure if this is correct?? Should I have separate files for the respective scraping? 
# and then what is going on with the env file? 
def scrape_all_events() -> dict:
    brown_events = scrape_brown_events()
    eventbrite_scraper = EventbriteScraper('https://www.eventbrite.com/d/ri--providence/all-events/')
    eventbrite_events = eventbrite_scraper.get_events()

    return {
        'brown_events': [event.to_json() for event in brown_events],
        'eventbrite_events': [event.to_json() for event in eventbrite_events]
    }

if __name__ == "__main__":
    all_events = scrape_all_events()
    print(all_events)
