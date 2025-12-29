import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

// Get priority color and icon
const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'urgent':
      return {
        color: theme.colors.error,
        icon: 'alert-circle',
        label: 'Haster',
        bgColor: theme.colors.error + '15',
      };
    case 'important':
      return {
        color: theme.colors.warning,
        icon: 'warning',
        label: 'Viktig',
        bgColor: theme.colors.warning + '15',
      };
    default:
      return {
        color: theme.colors.info,
        icon: 'information-circle',
        label: 'Info',
        bgColor: theme.colors.info + '15',
      };
  }
};

// Format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} t siden`;
  if (diffDays === 1) return 'I går';
  if (diffDays < 7) return `${diffDays} dager siden`;
  
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
};

// Message Card Component
const MessageCard = ({ message, isRead, onPress }) => {
  const priority = getPriorityStyle(message.priority);
  
  return (
    <TouchableOpacity
      style={[
        styles.messageCard,
        !isRead && styles.messageCardUnread,
        message.priority === 'urgent' && styles.messageCardUrgent,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.messageHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: priority.bgColor }]}>
          <Icon name={priority.icon} size={14} color={priority.color} />
          <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
        </View>
        <Text style={styles.messageTime}>{formatRelativeTime(message.createdAt)}</Text>
      </View>
      
      <Text style={[styles.messageTitle, !isRead && styles.messageTitleUnread]}>
        {message.title}
      </Text>
      
      <Text style={styles.messagePreview} numberOfLines={3}>
        {message.message}
      </Text>
      
      <View style={styles.messageFooter}>
        <View style={styles.authorInfo}>
          <Icon name="person-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={styles.authorName}>{message.authorName}</Text>
        </View>
        {!isRead && (
          <View style={styles.unreadBadge}>
            <View style={styles.unreadDot} />
            <Text style={styles.unreadText}>Ny</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Message Detail Modal/View
const MessageDetailView = ({ message, onClose }) => {
  const priority = getPriorityStyle(message.priority);
  
  return (
    <View style={styles.detailOverlay}>
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priority.bgColor }]}>
            <Icon name={priority.icon} size={16} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.detailTitle}>{message.title}</Text>
        
        <View style={styles.detailMeta}>
          <View style={styles.metaItem}>
            <Icon name="person-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{message.authorName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(message.createdAt).toLocaleDateString('nb-NO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        
        <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.detailMessage}>{message.message}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default function ActivityMessagesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [readMessages, setReadMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get user ID
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('@medvandrerne_user_id');
      setUserId(id);
    };
    getUserId();
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!activity?.id) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/activity-messages/get.php?activityId=${activity.id}${userId ? `&userId=${userId}` : ''}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessages(result.messages || []);
          
          // Track which messages are read
          const readIds = result.messages
            .filter(m => userId && m.readBy?.includes(userId))
            .map(m => m.id);
          setReadMessages(readIds);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activity?.id, userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  // Mark messages as read
  const markAsRead = async (messageIds) => {
    if (!userId || !activity?.id) return;
    
    try {
      await fetch(`${API_BASE_URL}/activity-messages/mark-read.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId: userId,
          messageIds: messageIds,
        }),
      });
      
      setReadMessages(prev => [...new Set([...prev, ...messageIds])]);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
  };

  const handleMessagePress = (message) => {
    setSelectedMessage(message);
    if (!readMessages.includes(message.id)) {
      markAsRead([message.id]);
    }
  };

  const handleCloseDetail = () => {
    setSelectedMessage(null);
  };

  // Mark all as read when entering screen
  useEffect(() => {
    if (messages.length > 0 && userId) {
      const unreadIds = messages
        .filter(m => !readMessages.includes(m.id))
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        // Delay marking as read to give user time to see "new" badges
        setTimeout(() => {
          markAsRead(unreadIds);
        }, 3000);
      }
    }
  }, [messages, userId]);

  if (!activity) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle-outline" size={64} color={theme.colors.textTertiary} />
        <Text style={styles.errorText}>Ingen aktivitet valgt</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster meldinger...</Text>
      </View>
    );
  }

  const unreadCount = messages.filter(m => !readMessages.includes(m.id)).length;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Icon name="chatbubbles" size={28} color={theme.colors.white} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>{activity.title}</Text>
                <Text style={styles.headerSubtitle}>
                  {messages.length} melding{messages.length !== 1 ? 'er' : ''}
                  {unreadCount > 0 && ` • ${unreadCount} ulest${unreadCount !== 1 ? 'e' : ''}`}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Messages List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.scrollContentWeb,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {messages.length > 0 ? (
            <View style={styles.messagesList}>
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  isRead={readMessages.includes(message.id)}
                  onPress={() => handleMessagePress(message)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name="chatbubble-ellipses-outline" size={64} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Ingen meldinger ennå</Text>
              <Text style={styles.emptyText}>
                Arrangøren har ikke sendt ut noen meldinger til denne aktiviteten ennå. 
                Du vil få varsel når det kommer nye meldinger.
              </Text>
            </View>
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      {/* Message Detail Overlay */}
      {selectedMessage && (
        <MessageDetailView
          message={selectedMessage}
          onClose={handleCloseDetail}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },

  // Header
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  headerSubtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },

  // Messages List
  messagesList: {
    gap: theme.spacing.md,
  },

  // Message Card
  messageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  messageCardUnread: {
    backgroundColor: theme.colors.primary + '08',
    borderColor: theme.colors.primary + '30',
  },
  messageCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  priorityText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  messageTime: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  messageTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  messageTitleUnread: {
    fontWeight: '800',
  },
  messagePreview: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  authorName: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  unreadText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  // Detail Overlay
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  detailContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  detailContent: {
    padding: theme.spacing.lg,
    maxHeight: 300,
  },
  detailMessage: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 26,
  },

  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

