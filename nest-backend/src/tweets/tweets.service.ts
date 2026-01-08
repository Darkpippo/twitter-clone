import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../common/data';
import { Tweet, tweets, comments, users, cleanUser } from '../common/data';

@Injectable()
export class TweetsService {
  getAll() {
  return tweets.map(tweet => ({
    ...tweet,
    commentsCount: comments.filter(c => c.tweetId === tweet.id).length,
        user: cleanUser(users.find(u => u.id === tweet.authorId) || { 
      id: '', name: 'Unknown', username: 'user', email: '' 
    }),
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


  create(content: string, author: User): Tweet {
    const tweet: Tweet = {
      id: randomUUID(),
      authorId: author.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
    };
    tweets.push(tweet);
    return tweet;
  }

  async toggleLike(tweetId: string, user: User): Promise<Tweet> {
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');
    const idx = tweet.likes.indexOf(user.id);
    if (idx > -1) tweet.likes.splice(idx, 1);
    else tweet.likes.push(user.id);
    return tweet;
  }

  getComments(tweetId: string) {
    return comments
      .filter(c => c.tweetId === tweetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(c => ({
        ...c,
        user: cleanUser(users.find(u => u.id === c.authorId) || { 
          id: '', name: 'Unknown', username: 'user', email: '' 
        }),
      }));
  }

  createComment(content: string, tweetId: string, author: User) {
    const comment = {
      id: randomUUID(),
      content: content.trim(),
      authorId: author.id,
      tweetId,
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    return comment;
  }

  async retweet(originalId: string, author: User): Promise<Tweet> {
    const original = tweets.find(t => t.id === originalId);
    if (!original) throw new NotFoundException('Tweet not found');
    if (original.authorId === author.id) throw new BadRequestException('Cannot retweet own post');

    const retweet: Tweet = {
      id: randomUUID(),
      authorId: author.id,
      content: original.content,
      createdAt: new Date().toISOString(),
      likes: [],
      originalTweetId: original.id, 
    };
    
    tweets.push(retweet);
    return retweet;
  }
}
