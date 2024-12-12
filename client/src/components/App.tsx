import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "../styles/App.css";
import "../styles/index.css";
import "../output.css";
import ActivityFinder from "./ActivityFinder";
import Home from "./Home";
import Footer from "./Footer";
import ThreeBearsImage from "../assets/Top3Bears.png";
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

// use useUser to get username?

function App() {
  return (
    <Router>
      <div className="bg-customBrown min-h-screen flex flex-col">
        <main className="flex-grow">
          <SignedOut>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow flex flex-col items-center justify-center space-y-4 md:space-y-10">
                <img
                  src={ThreeBearsImage}
                  alt="3 bears in a row"
                  className="w-60 md:w-96 h-auto overflow-hidden relative"
                />
                <p
                  className="limelight text-3xl md:text-7xl text-white"
                  aria-label="Page Title"
                >
                  Bear Tracks
                </p>
                <div className="flex flex-row space-x-3 md:space-x-7">
                  <div className="paytone-one bg-customRed text-white rounded-lg text-md px-3 py-1 md:px-7 md:py-2 md:text-xl">
                    <SignUpButton>SIGN UP</SignUpButton>
                  </div>
                  <div className="paytone-one bg-customRed text-white rounded-lg text-md px-3 py-1 md:px-7 md:py-2 md:text-xl">
                    <SignInButton>LOG IN</SignInButton>
                  </div>
                </div>
              </div>
              <Footer />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col min-h-screen">
              <div className="flex w-full justify-end p-4">
                <div className="paytone-one bg-customRed text-white rounded-lg flex items-center justify-center text-md px-2 py-1 md:px-4 md:py-2 md:text-xl">
                  <SignOutButton>LOG OUT</SignOutButton>
                </div>
              </div>
              <div className="flex-grow">
                {/* <ActivityFinder/> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/activity-finder" element={<ActivityFinder />} />
                  <Route path="/user-profile" element={<UserProfile />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </SignedIn>
        </main>
      </div>
    </Router>
  );
}

export default App;
