// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBbESZZ1N7pjRasKH26j8jmdkeJTJYRV4",
  authDomain: "hospital-ai-app-3ba71.firebaseapp.com",
  projectId: "hospital-ai-app-3ba71",
  storageBucket: "hospital-ai-app-3ba71.firebasestorage.app",
  messagingSenderId: "561301398977",
  appId: "1:561301398977:web:1add01394de4c78ebabb40",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
