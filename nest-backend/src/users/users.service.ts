import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { tweets, users, follows } from '../common/data';
import { User, cleanUser } from '../common/data';

interface Follow { userId: string; targetId: string; }

@Injectable()
export class UsersService {
  getAll() {
    return users.map(user => cleanUser(user));
  }

  getProfile(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new NotFoundException('User not found');
    
    const userTweets = tweets.filter(t => t.authorId === userId);
    const followers = this.getFollowers(userId);
    const followingIds = this.getFollowingIds(userId);
    
    return {
      user: cleanUser(user),
      tweets: userTweets,
      tweetsCount: userTweets.length,
      followersCount: followers.length,
      followingCount: followingIds.length,
    };
  }

  toggleFollow(targetId: string, currentUser: User) {
    console.log('Toggle follow:', { currentUserId: currentUser.id, targetId, followsLength: follows.length });
    
    const existingIdx = follows.findIndex(f => 
      f.userId === currentUser.id && f.targetId === targetId
    );
    
    if (existingIdx > -1) {
      follows.splice(existingIdx, 1);
      console.log('Unfollowed - follows now:', follows.length);
    } else {
      follows.push({ userId: currentUser.id, targetId });
      console.log('Followed - follows now:', follows.length);
    }
    
    return { ok: true };
  }

  getFollowers(targetId: string) {
    const followers = users.filter(u => 
      follows.some(f => f.userId === u.id && f.targetId === targetId)
    );
    return followers;
  }

  getFollowingIds(userId: string) {
    if (!userId) return [];
    return follows
      .filter(f => f.userId === userId)
      .map(f => f.targetId);
  }
}
