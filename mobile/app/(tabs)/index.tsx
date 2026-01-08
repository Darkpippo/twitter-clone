import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@/src/config/api';

interface Tweet {
  id: string;
  content: string;
  user: { 
    name: string; 
    username: string; 
    id: string;
    followingMe?: boolean;
  };
  createdAt: string;
  likes: string[];
  commentsCount?: number;
  retweetsCount: number;
  likedByMe: boolean;
  originalTweetId?: string | null; 
  originalAuthorName?: string; 
}

export default function HomeScreen() {
  const { user, token, logout } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [followStates, setFollowStates] = useState<{[userId: string]: boolean}>({});
  const [newTweet, setNewTweet] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchTweets();
  }, []);

const fetchTweets = async () => {
  try {
    const [tweetsRes, followingRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/tweets`),
      fetch(`${API_BASE_URL}/api/users/${user?.id}/following`, { 
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);

    const data = await tweetsRes.json();
    const followData = await followingRes.json();
    const followingIds = followData.followingIds || [];

    const followMap: Record<string, boolean> = {};
    followingIds.forEach((id: string) => followMap[id] = true);

    const enhancedTweets = data.map((tweet: any) => ({
      ...tweet,
      likedByMe: tweet.likes?.includes(user?.id || ''),
      retweetsCount: 0,
      user: {
        ...tweet.user,
        followingMe: followMap[tweet.user.id] || false,
      },
    }));

    setTweets(enhancedTweets);
    setFollowStates(followMap);
  } catch (e) {
    console.error('Fetch failed:', e);
  }
};

const fetchComments = async (tweetId: string) => {
  setLoadingComments(true);
  try {
    const res = await fetch(`${API_BASE_URL}/api/tweets/${tweetId}/comment`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      
      setComments(data);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet.id === tweetId
            ? { ...tweet, commentsCount: data.length }
            : tweet
        )
      );
    } else {
      setComments([]);
    }
  } catch (e) {
    console.error('Failed to fetch comments:', e);
    setComments([]);
  } finally {
    setLoadingComments(false);
  }
};

const postComment = async () => {
  if (!newComment.trim() || !selectedTweetId) return;
  
  try {
    await fetch(`${API_BASE_URL}/api/tweets/${selectedTweetId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment.trim() }),
    });
    setNewComment('');
    await fetchComments(selectedTweetId);
  } catch (e) {
    Alert.alert('Error', 'Failed to post comment');
  }
};

  const handlePostTweet = async () => {
    if (!newTweet.trim() && !newImageUrl.trim()) return;

    try {
      await fetch(`${API_BASE_URL}/api/tweets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: newTweet.trim(), 
          imageUrl: newImageUrl.trim() || undefined 
        }),
      });
      setNewTweet('');
      setNewImageUrl('');
      fetchTweets();
    } catch (e) {
      Alert.alert('Error', 'Failed to post tweet');
    }
  };

  const toggleLike = async (tweetId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/tweets/${tweetId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTweets();
    } catch (e) {
      Alert.alert('Error', 'Failed to like tweet');
    }
  };

  const handleRetweet = async (tweetId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/tweets/${tweetId}/retweet`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTweets(); 
    } catch (e) {
      Alert.alert('Error', 'Cannot retweet your own post');
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (targetUserId === user?.id) return;
    
    const isFollowing = followStates[targetUserId];   
    
    try {
      await fetch(`${API_BASE_URL}/api/users/${targetUserId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTweets();  
    } catch (e) {
      Alert.alert('Error', `Failed to ${isFollowing ? 'unfollow' : 'follow'}`);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.compose}>
        <TextInput
          style={styles.tweetInput}
          placeholder={`What's happening, ${user.username}?`}
          value={newTweet}
          onChangeText={setNewTweet}
          multiline
          maxLength={280}
        />
        <TextInput
          style={styles.imageInput}
          placeholder="Image URL (optional)"
          value={newImageUrl}
          onChangeText={setNewImageUrl}
        />
        <TouchableOpacity
          style={[
            styles.tweetButton, 
            !(newTweet.trim() || newImageUrl.trim()) && styles.disabled
          ]}
          onPress={handlePostTweet}
          disabled={!(newTweet.trim() || newImageUrl.trim())}
          activeOpacity={0.8}
        >
          <Text style={styles.tweetButtonText}>Tweet</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tweet}>
            <View style={styles.authorContainer}>
              <Text style={styles.authorId}>
              {item.user?.name || 'Unknown'}
              <Text style={styles.username}>
                @{item.user?.username || 'user'}
              </Text>
            </Text>
              {item.originalTweetId && (
              <Text style={{ fontSize: 12, color: '#657786', marginBottom: 4 }}>
                🔁 Retweeted from {item.originalAuthorName}
              </Text>
              )}
             <TouchableOpacity 
              style={[
                styles.followButton,
                item.user.id === user.id && styles.disabled,
                followStates[item.user.id] && styles.followingButton 
              ]}
              onPress={() => handleFollow(item.user.id)}
              disabled={item.user.id === user.id}
            >
              <Text style={[
                styles.followButtonText,
                followStates[item.user.id] && styles.followingButtonText 
              ]}>
                {followStates[item.user.id] ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            </View>

            <Text style={styles.content}>{item.content}</Text>
            {item.imageUrl && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageUrl}>{item.imageUrl}</Text>
              </View>
            )}
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            
            <View style={styles.actions}>
              <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                setSelectedTweetId(item.id);
                fetchComments(item.id);
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#657786" />
              <Text style={styles.actionText}> {item.commentsCount || 0}</Text>
            </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  item.user.id === user.id && styles.disabled
                ]} 
                onPress={() => handleRetweet(item.id)}
                disabled={item.user.id === user.id}
              >
                <Ionicons name="repeat-outline" size={20} color="#657786" />
                <Text style={styles.actionText}>{item.originalTweetId?.split(",").length}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  item.likedByMe && styles.likedButton
                ]}
                onPress={() => toggleLike(item.id)}
              >
                <Ionicons 
                  name={item.likedByMe ? "heart" : "heart-outline"} 
                  size={20} 
                  color={item.likedByMe ? "#e0245e" : "#657786"} 
                />
                <Text style={[
                  styles.actionText,
                  item.likedByMe && styles.likedText
                ]}>
                  {item.likes?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No tweets yet. Be the first!</Text>
        }
      />
      {selectedTweetId && (
  <View style={styles.commentModal}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Reply</Text>
      <TouchableOpacity onPress={() => setSelectedTweetId(null)}>
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>
    </View>
    
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.comment}>
          <Text style={styles.commentAuthor}>
            <Text style={styles.commentUserName}>{item.user?.name || 'Unknown'}</Text>
            <Text style={styles.commentUsername}>@{item.user?.username || 'user'}</Text>
          </Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
      style={styles.commentsList}
/>

    
    <View style={styles.commentInputContainer}>
      <TextInput
        style={styles.commentInput}
        placeholder="Tweet your reply"
        value={newComment}
        onChangeText={setNewComment}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.postCommentButton,
          !newComment.trim() && styles.disabled
        ]}
        onPress={postComment}
        disabled={!newComment.trim()}
      >
        <Text style={styles.postCommentText}>Reply</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout @{user.username}</Text>
      </TouchableOpacity>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  newTweet: { marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 12 },
  tweetInput: { 
    borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, 
    minHeight: 60, marginBottom: 12, backgroundColor: 'white' 
  },
  tweet: { 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' 
  },
  authorId: { fontWeight: 'bold', marginBottom: 4 },
  content: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  date: { color: '#666', fontSize: 12 },
  empty: { textAlign: 'center', padding: 40, color: '#666' },
  username: { 
    fontWeight: 'normal', 
    color: '#657786', 
    marginLeft: 4 
  },
  imageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  imageContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  imageUrl: {
    color: '#1d9bf0',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likedButton: {
    opacity: 0.7,
  },
  actionText: {
    marginLeft: 6,
    color: '#657786',
    fontWeight: '500',
  },
  likedText: {
    color: '#e0245e',
  },
  tweetButton: { 
    backgroundColor: '#1d9bf0',           
    paddingVertical: 14, 
    paddingHorizontal: 24,  
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#1d9bf0', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(29, 155, 240, 0.3)',
  },
  tweetButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 17,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disabled: { 
    backgroundColor: '#b5d7ff',
    shadowOpacity: 0.1,
    borderColor: 'rgba(181, 215, 255, 0.5)',
  },
  logout: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(194, 17, 17, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    shadowColor: '#f01d1dff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#000000ff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  compose: {
    backgroundColor: 'rgba(247, 249, 249, 0.8)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(29, 155, 240, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  followButton: {
    backgroundColor: '#1d9bf0',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#1d9bf0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  followingButton: {
    backgroundColor: '#e8f5fd',
    borderColor: '#b3d9f0',
    borderWidth: 1,
    shadowOpacity: 0.1,
    opacity: 0.8,
  },
  followingButtonText: {
    color: '#1a91da',  
    fontWeight: '500',
  },
commentModal: {
  position: 'absolute',
  bottom: 0,       
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTopLeftRadius: 24,   
  borderTopRightRadius: 24,
  maxHeight: '80%',        
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 25,           
  zIndex: 999,             
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
},
commentsList: {
  flex: 1,
  paddingHorizontal: 20,
},
commentAuthor: {
  fontSize: 16,
  lineHeight: 20,
},
commentInputContainer: {
  flexDirection: 'row',
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},
commentInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginRight: 12,
  backgroundColor: '#f8f9fa',
},
postCommentButton: {
  backgroundColor: '#1d9bf0',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 20,
  justifyContent: 'center',
},
postCommentText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
comment: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
commentUserName: {
  fontWeight: 'bold',
  fontSize: 16,
},
commentUsername: {
  fontWeight: 'normal',
  color: '#657786',
  marginLeft: 4,
  fontSize: 15,
},
commentContent: {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 2,
  marginBottom: 4,
},
commentDate: {
  color: '#666',
  fontSize: 12,
  marginTop: 4,
},

});
