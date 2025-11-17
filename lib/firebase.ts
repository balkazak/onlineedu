import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmpXgzcoBLU6quIuTwa67F2cLYWjJ_DKY",
  authDomain: "education-platform-226f0.firebaseapp.com",
  databaseURL: "https://education-platform-226f0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "education-platform-226f0",
  storageBucket: "education-platform-226f0.firebasestorage.app",
  messagingSenderId: "54928043032",
  appId: "1:54928043032:web:741d6a418cfa88bc5f676d",
  measurementId: "G-E5Y3ECLY70"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

if (typeof window !== "undefined") {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };
export default app;

