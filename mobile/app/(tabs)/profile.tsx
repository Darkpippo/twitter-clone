import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Button, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@/src/config/api';

export default function ProfileScreen() {
  const { user, logout, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [tweetsCount, setTweetsCount] = useState();
  const [followingCount, setFollowingCount] = useState();
  const [followersCount, SetFollowersCount] = useState();
  const [profileData, setProfileData] = useState<any>(null);
  const [tweets, setTweets] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`);
        const data = await res.json();
        console.log(data);
        setProfile(data.user);  
        setTweets(data.tweets || []);
        setTweetsCount(data.tweets?.length || 0);
        setFollowingCount(data?.followersCount);
        SetFollowersCount(data?.followersCount);
        setProfileData(data);
      } catch {
        Alert.alert('Error', 'Failed to load profile');
      }
    };
    loadProfile();
  }, [user]);

  const refreshFollowers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user?.id}/followers`);
      const data = await res.json();
      Alert.alert('Followers', `You have ${data.length} followers`);
    } catch {
      Alert.alert('Error', 'Failed to load followers');
    }
  };

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{tweetsCount}</Text>
          <Text>Tweets</Text>
        </View>
        <TouchableOpacity onPress={refreshFollowers} style={styles.stat}>
          <Text style={styles.statNumber}>{followersCount || 0}</Text>
          <Text>Followers</Text>
        </TouchableOpacity>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{followingCount || 0}</Text>
          <Text>Following</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Logout" onPress={logout} color="#ff4444" />  
      </View>

      <Text style={styles.sectionTitle}>Tweets</Text>
      {tweets.length === 0 ? (
        <Text style={styles.empty}>No tweets yet</Text>
      ) : (
        <FlatList
          data={tweets}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <View style={styles.tweet}>
              <Text style={styles.tweetContent}>{item.content}</Text>
              <Text style={styles.tweetTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 24, paddingTop: 48 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  username: { fontSize: 16, color: '#666', marginBottom: 8 },
  email: { fontSize: 14, color: '#888' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginVertical: 24,
  },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1d9bf0' },
  actions: { paddingHorizontal: 24, marginBottom: 24 },
  passwordSection: { marginTop: 12, padding: 16, backgroundColor: '#f8f9fa' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  passwordButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 24, marginBottom: 12 },
  tweet: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  tweetContent: { fontSize: 16, lineHeight: 22, marginBottom: 4 },
  tweetTime: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', color: '#888', padding: 48, fontSize: 16 },
});
