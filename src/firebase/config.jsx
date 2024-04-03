import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCAYOYDuMKGGjTSJL5uDzG5hjQ6y_vYPiI",
//   authDomain: "auction-website-b12fc.firebaseapp.com",
//   databaseURL: "https://auction-website-b12fc.firebaseio.com",
//   projectId: "auction-website-b12fc",
//   storageBucket: "auction-website-b12fc.appspot.com",
//   messagingSenderId: "791747024664",
//   appId: "1:791747024664:web:215a222a81c6d0c2aeb06d",
// };

const firebaseConfig = {
  apiKey: "AIzaSyCZkgbRjjY7rLLVjkYPadG_jd1-hMDWGZA",
  authDomain: "auction-app-10a9b.firebaseapp.com",
  projectId: "auction-app-10a9b",
  storageBucket: "auction-app-10a9b.appspot.com",
  messagingSenderId: "114663643795",
  appId: "1:114663643795:web:f13f628d15051355aacb66",
  measurementId: "G-NW030D8WGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);