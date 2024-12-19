# final-project-mia-ashley-sophia-kaluki
Final Project — Bear Tracks Activity Finder 

# Team Members and Contributions 

Kaluki Kithome 

cslogin: kkithome 

Sophia Lloyd George 

cslogin: slloydge 

Mia Nguyen 

cslogin: hgnguyen 

Ashley Woertz: 

cslogin: awoertz

# Contributions 
We worked on this assignment together and designated specific tasks if we were unable to meet in person. Initially, Kaluki and Sophia were working on the backend code, writing web scrapers to scrape events from events@brown and eventbrite; meanwhile, Ashley and Mia were working on frontend design (figma) and development. Halfway through our project's development, Sophia moved to the frontend and Ashley shifted focus to integration of the backend and frontend; Mia continued to work on key frontend components, such as activities.tsx and mapbox.tsx, and Kaluki puzzled through the relation between the backend and the firebase storage of web scraped data. Lastly, we wrote tests for the frontend; as our backend primarily consists of the web scrapers, we will demonstrate that our backend works as expected by contrasting it with eventbrite and today@brown data as well as the firebase storage of data.  

# Link to repo: 
https://github.com/cs0320-f24/final-project-mia-ashley-sophia-kaluki

# Total time: 
90 hours 

# Citations 

OpenAI. (2024). ChatGPT (May 13 version) [Large language model]. https://chat.openai.com/chat/

We used ChatGPT to help with the process builder that allowed us to call the scraper using Java. Additionally, ChatGPT was helpful for debugging firebase functions that update what events the user will be attending (and to maintain a local state via a button).

Tailwind CSS. (n.d.). Tailwind CSS documentation (v2). Retrieved December 2, 2024, from https://v2.tailwindcss.com/docs

We used tailwind CSS to match our design on figma to our frontend code. 

Bright Data. (n.d.). Web scraping with Python: A how-to guide. Retrieved November 20, 2024, from https://brightdata.com/blog/how-tos/web-scraping-with-python


Lecture 23: Searching & Sorting. (n.d.). CS0112: Computation Foundations: Data. https://cs0112.github.io/Lectures/lecture23.html

We used CS0112's site as a starting point for web scraping. 

# Design Choices

Despite the numerous interesting (and free!) events that happen at Brown and in Providence as a whole, many students miss out on them because they are not yet subscribed to the corresponding channel, including Today@Brown or department-specific newsletters. Keeping track of events in Providence can be even trickier, as information about these events is often disseminated through channels that aren’t affiliated with Brown. Accordingly, our platform, Bear Tracks, provides a centralized list of events and activities at Brown and in the broader Providence community. Our platform prioritizes the safety and security of our users; only users with a brown.edu email address are able to create an account and login. When users login to our account, they will be able to see events that are webscraped from events@brown and eventbrite for Providence; the user can scroll through these events, which are displayed over several pages. Furthermore, events feature a description, # of attendees, an image, time of occurence, and address. A user can also press add to calendar to add an event to their calendar, click going to add themselves to the attendees list (which is visible if one clicks on an event title to learn more), or heart it to add the event to their favorites list. If a user clicks on their user profile, they can see their "favorited" list of events, adjust the anonymity of their profile, and see a list of upcoming events. On the main activity page, users can also see a map display of events in Providence; they may also click the search button and narrow their activity search by different parameters. In particular, a user may filter their event search by keyword, time of day, category, date, on-campus/off-campus, and location; activityfinder.tsx will then load the activities from firebase. 

Our backend primarily consists of the web scraping functionality, which pulls events from events@brown and Providence eventbrite and stores the events via firestore; while we tried to do querying and searching on the backend, firebase documentation suggested that it would be best to use their "front end" querying methods. Hence, our frontend handles querying and searching. 

# Errors/Bugs

Due to the inconsisency of some fields when web scraping from Providence eventbrite, we ended up with a null field for date/time for some of our events. Because of the issues with the null time/date, the calendar function is a bit finicky. While we wrote the code for the anonymous function, it is currently not working since we can't set up the database due to firebase quota limits, so the list of attendees for any given event is public; moroever, the list of attendees can sometimes be a bit fickle/take a while to update. In future development of Bear Tracks, we also would like to link the pins to the specific events they represent so that a user can properly identify them; we also hope to integrate route generation into our application. 

# Tests

We test for: 
* testing that a brown.edu user can authenticate

* testing for error message when a non-brown.edu user tries to create an account

* testing that keyword search for bee shows one event

* testing that visual elements are appearing properly on the activity finder page

* testing that two events are filtered by category and keyword 

* testing that clicking going increases attendance by 1

* testing that favoriting an event adds it to the user profile favorited events list

* testing that search with keyword 'coffee' yields brown bee coffee

* testing that a page description and event fields are displayed when a user clicks on an activity

* testing that the key visual elements (bear images, headers, map) appear on the login page

* testing that a narrower search (using the on-campus filter, museum keyword, and address) yields RISD museum

* testing that clicking on an event from favorites list redirects us to that page

* testing that attendee list exists for an event

* testing for anonimity


# How to Run Our Program

To run our program, run npm run build (if you haven't done so already!) and then npm run start, which will bring you to a local host url (http://localhost:8000/). You will first see the home page entitled "Bear Tracks," from which you may create an account or login. From the activity finder page, you can use all of the aforementioned featrues of our platform (searching, favoriting, user profile, map display, and so forth). 


# Collaboration
We collaborated with each other as well as Sarah (our mentor TA)
