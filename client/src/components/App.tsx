import { initializeApp } from "firebase/app";
import "../styles/App.css";
import ActivityFinder from "./ActivityFinder";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

// use useUser to get username?

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// Initialize Firebase with the provided configuration
initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              padding: "10px",
              gap: "10px",
            }}
          >
            <SignOutButton />
            <UserButton />
          </div>
          <ActivityFinder />
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
