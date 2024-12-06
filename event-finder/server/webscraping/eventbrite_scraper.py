class EventbriteScraper:
    """Scraper for Eventbrite events."""
    def __init__(self, url: str):
        self.url = url
        self.events = []
        self.ids = set()

    def fetch_page(self) -> BeautifulSoup:
        response = requests.get(self.url)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')

    def parse_events(self, soup: BeautifulSoup):
        sections = soup.find_all('section', class_='event-card-details')
        for section in sections:
            event_link = section.a
            event_id = event_link['data-event-id']
            if event_id in self.ids:
                continue
            self.ids.add(event_id)

            image = section.parent.find('img', class_='event-card-image')
            event = EventbriteEvent(
                title=event_link['aria-label'],
                category=event_link.get('data-event-category'),
                location=event_link['data-event-location'],
                paid=event_link['data-event-paid-status'] == 'paid',
                date_str=section.p.text.strip(),
                img_url=image['src'] if image else None,
                event_id=event_id
            )
            self.events.append(event)

    def get_events(self) -> list[EventbriteEvent]:
        soup = self.fetch_page()
        self.parse_events(soup)
        return self.events
