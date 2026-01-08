import { randomUUID } from 'crypto';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
}

export interface Tweet {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[];
  originalTweetId?: string;
  commentsCount?: number; 
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  tweetId: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

export const cleanUser = (user: User | any): SafeUser => ({
  id: user?.id || '',
  name: user?.name || 'Unknown',
  username: user?.username || 'user',
  email: user?.email || '',
});

export let users: User[] = [];
export let tweets: Tweet[] = [];
export let comments: Comment[] = [];
export let follows: { userId: string; targetId: string }[] = [];