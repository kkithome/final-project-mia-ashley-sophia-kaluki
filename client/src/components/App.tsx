import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import ActivityFinder from "./ActivityFinder";
import ActivityPage from "./ActivityPage";
import Home from "./Home";
import Footer from "./Footer";
import ThreeBearsImage from "../assets/Top3Bears.png";
import Bear4 from "../assets/Bear4.png";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  UserProfile,
  useUser,
} from "@clerk/clerk-react";
import UserP from "./UserP";
import Searcher from "./Searcher";

// use useUser to get username?

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// initialize Firebase with the provided configuration
let app;
if (!app) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
  console.log("App already created");
}

const db = getFirestore(app);

export { db };

function App() {
  return (
    /** create routes */
    <Router>
      <div className="bg-customBrown min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="space-y-32 relative">
            <div className="flex flex-row justify-stretch">
              <SignedIn>
                <div className = "basis-1/4">
                </div>
                <div className="basis-1/2 flex flex-row items-center justify-center">
                <img
                  src={Bear4}
                  alt="A bear"
                  className="w-12 md:w-32 h-auto overflow-hidden relative"
                />
                <p
                    className="limelight text-2xl md:text-5xl xl:text-7xl text-white"
                    aria-label="Page Title"
                  >
                    Bear Tracks
                  </p>
                </div>
                <div className="flex justify-end p-4 basis-1/4">
                  <div className="flex items-center justify-center mx-4 my-auto mt-[5px] md:mt-[10px]">
                    <UserButton />
                  </div>
                  <div className="paytone-one bg-customRed text-white rounded-lg flex items-center justify-center text-md w-24 md:w-28 h-8 md:h-11 md:text-xl">
                    <SignOutButton>LOG OUT</SignOutButton>
                    
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
          <div className="flex flex-col min-h-screen">
            <SignedIn>
              <div className="flex-grow">
                {/* <ActivityFinder/> */}
                <Routes>
                  <Route path="/" element={<ActivityFinder />} />
                  <Route path="/activity-finder" element={<ActivityFinder />} />
                  <Route path="/user-profile" element={<UserP />} />
                  <Route path="/activity/:id" element={<ActivityPage />} />
                  <Route path="/searcher" element={<Searcher />} />
                  <Route path="/home" element={<Home />} />
                </Routes>
              </div>
            </SignedIn>
            <SignedOut>
                  <div className="flex flex-col items-center justify-center flex-grow my-auto">
                    <img
                      src={ThreeBearsImage}
                      alt="A bear"
                      className="w-64 md:w-72 h-auto overflow-hidden relative"
                    />
                    <p
                      className="limelight text-3xl md:text-7xl text-center text-white"
                      aria-label="Page Title"
                    >
                      Bear Tracks
                    </p>
                  <div className="flex justify-center flex-row space-x-3 md:space-x-7">
                    <div className="paytone-one bg-customRed text-white rounded-lg text-md px-3 py-1 md:px-7 md:py-2 md:text-xl">
                      <SignUpButton>SIGN UP</SignUpButton>
                    </div>
                    <div className="paytone-one bg-customRed text-white rounded-lg text-md px-3 py-1 md:px-7 md:py-2 md:text-xl">
                      <SignInButton>LOG IN</SignInButton>
                    </div>
                  </div>
                  </div>
          
            </SignedOut>
            <Footer />
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
