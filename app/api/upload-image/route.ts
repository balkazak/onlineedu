import { NextRequest, NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
import { initializeApp, getApps } from "firebase/app";

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

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file || !path) {
      return NextResponse.json(
        { error: "File and path are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, buffer);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url: downloadURL });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

