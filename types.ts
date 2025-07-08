

export enum StoryCategory {
  Adventure = "مغامرات",
  SciFi = "خيال علمي",
  Fantasy = "خيال",
  Romance = "رومانسي",
  Mystery = "غموض",
  Horror = "رعب",
  Comedy = "كوميدي",
  Drama = "دراما",
}

export interface User {
  id: string;
  name: string;
  avatar: string; // base64 string
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  storyId: string;
  storyTitle: string;
  authorId: string;
  timestamp: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  authorId: string;
  coverImage?: string; // base64 string
  category: StoryCategory;
  createdAt: string;
  views: number;
  likes: string[]; // array of user IDs
  comments: Comment[];
}