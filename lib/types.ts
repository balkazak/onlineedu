export interface User {
  email: string;
  role: "admin" | "student" | "curator";
  allowedCourses: string[];
  allowedTests?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  youtubeLink: string;
  description?: string;
  test?: {
    questions: TestQuestion[];
  };
  solutionVideoLink?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  createdAt?: any;
}

export interface TestQuestion {
  q: string;
  qImage?: string;
  options: {
    label: string;
    text: string;
    image?: string;
  }[];
  answer: string;
}

export interface Test {
  id?: string;
  title: string;
  description?: string;
  questions: TestQuestion[];
  timeLimit: number;
  allowedUsers?: string[];
  createdAt?: any;
}

