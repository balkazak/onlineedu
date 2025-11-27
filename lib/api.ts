import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { User, Course, Test } from "./types";
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

const setCached = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (pattern: string): void => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

export const getUserData = async (email: string): Promise<User | null> => {
  if (!db) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      return { email, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  const cacheKey = "courses:all";
  const cached = getCached<Course[]>(cacheKey);
  if (cached) return cached;

  if (!db) return [];
  try {
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const courses = coursesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        lessons: data.lessons || [],
        createdAt: data.createdAt
      } as Course;
    });
    setCached(cacheKey, courses);
    return courses;
  } catch (error) {
    console.error("Error getting courses:", error);
    return [];
  }
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  const cacheKey = `course:${courseId}`;
  const cached = getCached<Course>(cacheKey);
  if (cached) return cached;

  if (!db) return null;
  try {
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    if (courseDoc.exists()) {
      const data = courseDoc.data();
      const course = { 
        id: courseDoc.id, 
        title: data.title || "",
        description: data.description || "",
        lessons: data.lessons || [],
        createdAt: data.createdAt
      } as Course;
      setCached(cacheKey, course);
      return course;
    }
    return null;
  } catch (error) {
    console.error("Error getting course:", error);
    return null;
  }
};

export const createCourse = async (course: Omit<Course, "id">): Promise<string | null> => {
  if (!db) return null;
  try {
    const cleanCourse = Object.fromEntries(
      Object.entries({
        ...course,
        createdAt: new Date()
      }).filter(([_, value]) => value !== undefined)
    ) as any;
    
    const docRef = await addDoc(collection(db, "courses"), cleanCourse);
    invalidateCache("courses");
    return docRef.id;
  } catch (error) {
    console.error("Error creating course:", error);
    return null;
  }
};

export const updateCourse = async (courseId: string, course: Partial<Course>): Promise<boolean> => {
  if (!db) return false;
  try {
    const cleanCourse = Object.fromEntries(
      Object.entries(course).filter(([_, value]) => value !== undefined)
    ) as any;
    
    await updateDoc(doc(db, "courses", courseId), cleanCourse);
    invalidateCache("courses");
    return true;
  } catch (error) {
    console.error("Error updating course:", error);
    return false;
  }
};

export const deleteCourse = async (courseId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "courses", courseId));
    invalidateCache("courses");
    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    return false;
  }
};

export const getAllTests = async (): Promise<Test[]> => {
  const cacheKey = "tests:all";
  const cached = getCached<Test[]>(cacheKey);
  if (cached) return cached;

  if (!db) return [];
  try {
    const testsSnapshot = await getDocs(collection(db, "tests"));
    const tests = testsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        questions: data.questions || [],
        timeLimit: data.timeLimit || 0,
        allowedUsers: data.allowedUsers || [],
        createdAt: data.createdAt
      } as Test;
    });
    setCached(cacheKey, tests);
    return tests;
  } catch (error) {
    console.error("Error getting tests:", error);
    return [];
  }
};

export const getTest = async (testId: string): Promise<Test | null> => {
  const cacheKey = `test:${testId}`;
  const cached = getCached<Test>(cacheKey);
  if (cached) return cached;

  if (!db) return null;
  try {
    const testDoc = await getDoc(doc(db, "tests", testId));
    if (testDoc.exists()) {
      const data = testDoc.data();
      const test = {
        id: testDoc.id,
        title: data.title || "",
        description: data.description || "",
        questions: data.questions || [],
        timeLimit: data.timeLimit || 0,
        allowedUsers: data.allowedUsers || [],
        createdAt: data.createdAt
      } as Test;
      setCached(cacheKey, test);
      return test;
    }
    return null;
  } catch (error) {
    console.error("Error getting test:", error);
    return null;
  }
};

export const createTest = async (test: Omit<Test, "id">): Promise<string | null> => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, "tests"), {
      ...test,
      createdAt: new Date()
    });
    invalidateCache("tests");
    return docRef.id;
  } catch (error) {
    console.error("Error creating test:", error);
    return null;
  }
};

export const updateTest = async (testId: string, test: Partial<Test>): Promise<boolean> => {
  if (!db) return false;
  try {
    await updateDoc(doc(db, "tests", testId), test);
    invalidateCache("tests");
    return true;
  } catch (error) {
    console.error("Error updating test:", error);
    return false;
  }
};

export const deleteTest = async (testId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "tests", testId));
    invalidateCache("tests");
    return true;
  } catch (error) {
    console.error("Error deleting test:", error);
    return false;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  if (!db) return [];
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map(doc => ({
      email: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const createUser = async (
  email: string, 
  password: string, 
  role: "admin" | "student", 
  allowedCourses: string[] = [],
  allowedTests: string[] = []
): Promise<boolean> => {
  if (!auth || !db) return false;
  try {
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email || null;
    
    await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", email), {
      email,
      role,
      allowedCourses,
      allowedTests: allowedTests || []
    });
    
    if (auth.currentUser && auth.currentUser.email === email) {
      await signOut(auth);
    }
    
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    if (auth.currentUser && auth.currentUser.email === email) {
      await signOut(auth);
    }
    return false;
  }
};

export const updateUser = async (email: string, userData: Partial<User>): Promise<boolean> => {
  if (!db) return false;
  try {
    await updateDoc(doc(db, "users", email), userData);
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
};

export const deleteUser = async (email: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "users", email));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error uploading image:", error);
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

