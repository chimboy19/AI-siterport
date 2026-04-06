import { Timestamp } from "firebase/firestore";

export  interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface SiteImage {
  url: string;
  path?: string;
  note?: string;
  localData?: string;
}

export interface Report {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  date: string;
  images: SiteImage[];
  generatedReport?: string;
  createdAt: Timestamp;
}

export interface UserSettings {
  uid: string;
  // Profile
  displayName: string;
  jobTitle: string;
  companyName: string;
  // Report Defaults
  defaultLanguage: 'en' | 'jp';
  defaultReportTitle: string;
  engineerName: string;
  updatedAt?: Timestamp;
}
