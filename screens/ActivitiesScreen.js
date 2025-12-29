import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Easing,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';
import { useRegistrations } from '../hooks/useRegistrations';
import { useInvitations } from '../hooks/useInvitations';
import { getLevelColors } from '../utils/journeyUtils';

const isWeb = Platform.OS === 'web';

const getActivityTypeColor = (type) => {
  switch (type) {
    case 'Tur':
      return theme.colors.success;
    case 'Motivasjonstur':
      return theme.colors.primary;
    case 'Møte':
      return theme.colors.info;
    case 'Arrangement':
      return theme.colors.warning;
    case 'Kurs':
      return '#9B59B6';
    case 'Konferanse':
      return '#3498DB';
    case 'Sosial':
      return '#E91E63';
    default:
      return theme.colors.textSecondary;
  }
};

export default function ActivitiesScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);
  const { data, loading, refreshData, clearDataCache, softRefresh, isDataStale } = useAppData();
  const { registrations, loadRegistrations, registerForActivity } = useRegistrations();
  const { 
    getPendingInvitations, 
    respondToInvitation, 
    fetchInvitations,
  } = useInvitations();
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null); // Track which invitation is being responded to
  
  // Kombiner Google Calendar og lokale aktiviteter
  const calendarEvents = data.calendar || [];
  const localActivities = data.activities || [];
  
  // Merge og sorter alle aktiviteter
  const activities = [...calendarEvents, ...localActivities].sort((a, b) => {
    return (a.date || '').localeCompare(b.date || '');
  });

  // Refresh data when screen gains focus if data is stale
  useFocusEffect(
    useCallback(() => {
      // Load registrations and invitations when focused
      loadRegistrations();
      fetchInvitations();
      
      // Soft refresh if data might be stale
      if (isDataStale && isDataStale()) {
        softRefresh && softRefresh();
      }
      
      // Animate if not already
      if (!hasAnimatedRef.current) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          hasAnimatedRef.current = true;
        });
      } else {
        fadeAnim.setValue(1);
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshData(),
      loadRegistrations(),
      fetchInvitations(),
    ]);
    setRefreshing(false);
  };

  // Handle responding to an invitation
  const handleInvitationResponse = async (invitation, accept) => {
    setRespondingTo(invitation.id);
    
    try {
      // Get the activity to register for if accepting
      const activity = activities.find(a => a.id === invitation.activityId);
      
      const result = await respondToInvitation(
        invitation.id, 
        accept ? 'accept' : 'decline',
        accept, // autoRegister
        'Medvandrer' // userName - ideally get from user context
      );
      
      if (result.success) {
        if (accept) {
          // Also register locally if we have the activity
          if (activity) {
            await registerForActivity(activity);
          }
          Alert.alert(
            '✅ Du er påmeldt!',
            `Du er nå påmeldt "${invitation.activityTitle}"`,
            [{ text: 'Flott!' }]
          );
        } else {
          Alert.alert(
            'Invitasjon avslått',
            `Du har avslått invitasjonen til "${invitation.activityTitle}"`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Feil', result.error || 'Kunne ikke svare på invitasjonen');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
    } finally {
      setRespondingTo(null);
    }
  };

  // Get pending invitations
  const pendingInvitations = getPendingInvitations();
  
  const markedDates = {};
  activities.forEach((activity) => {
    if (activity.date) {
      markedDates[activity.date] = {
        marked: true,
        dotColor: theme.colors.primary,
        selected: selectedDate === activity.date,
        selectedColor: theme.colors.primary,
      };
      // For flerdagsaktiviteter, marker alle datoer
      if (activity.multiDay && activity.endDate) {
        let currentDate = new Date(activity.date);
        const endDate = new Date(activity.endDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          markedDates[dateStr] = {
            marked: true,
            dotColor: theme.colors.primary,
            selected: selectedDate === dateStr,
            selectedColor: theme.colors.primary,
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
  });

  const getActivitiesForDate = (date) => {
    return activities.filter((activity) => {
      if (activity.multiDay && activity.endDate) {
        return date >= activity.date && date <= activity.endDate;
      }
      return activity.date === date;
    });
  };

  const selectedActivities = getActivitiesForDate(selectedDate);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCalendarPress = async () => {
    await WebBrowser.openBrowserAsync('https://www.google.com/calendar/embed?color=%23ffad46&src=medvandrerne.org_2ht93gv6gho6qdo7sft8h60a2c@group.calendar.google.com');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Tur':
        return 'walk';
      case 'Motivasjonstur':
        return 'map';
      case 'Møte':
        return 'people';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar';
    }
  };

  // Vis loading ved første innlasting
  if (loading && activities.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster aktiviteter...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <View style={styles.invitationsSection}>
            <View style={styles.invitationsHeader}>
              <Icon name="mail" size={18} color={theme.colors.info} />
              <Text style={styles.invitationsHeaderText}>Invitasjoner</Text>
              <View style={styles.invitationsBadge}>
                <Text style={styles.invitationsBadgeText}>{pendingInvitations.length}</Text>
              </View>
            </View>
            {pendingInvitations.map((invitation) => {
              const levelColors = getLevelColors(invitation.senderLevel || 1);
              const isResponding = respondingTo === invitation.id;
              
              return (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationTop}>
                    <View style={[styles.invitationAvatar, { borderColor: levelColors.primary }]}>
                      <Text style={[styles.invitationAvatarText, { color: levelColors.primary }]}>
                        {(invitation.senderName || 'M').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.invitationInfo}>
                      <Text style={styles.invitationSender}>{invitation.senderName || 'En Medvandrer'}</Text>
                      <Text style={styles.invitationText}>inviterer deg til</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.invitationActivityCard}
                    onPress={() => {
                      const activity = activities.find(a => a.id === invitation.activityId);
                      if (activity) {
                        navigation.navigate('ActivityDetail', { activity });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Icon name="calendar" size={20} color={theme.colors.primary} />
                    <View style={styles.invitationActivityInfo}>
                      <Text style={styles.invitationActivityTitle} numberOfLines={1}>
                        {invitation.activityTitle || 'Aktivitet'}
                      </Text>
                      {invitation.activityDate && (
                        <Text style={styles.invitationActivityDate}>
                          {new Date(invitation.activityDate).toLocaleDateString('nb-NO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Text>
                      )}
                    </View>
                    <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>

                  {invitation.message && (
                    <View style={styles.invitationMessage}>
                      <Icon name="chatbubble-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.invitationMessageText}>"{invitation.message}"</Text>
                    </View>
                  )}
                  
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={[styles.invitationDeclineButton, isResponding && styles.buttonDisabled]}
                      onPress={() => handleInvitationResponse(invitation, false)}
                      disabled={isResponding}
                      activeOpacity={0.7}
                    >
                      {isResponding && respondingTo === invitation.id ? (
                        <ActivityIndicator size="small" color={theme.colors.error} />
                      ) : (
                        <>
                          <Icon name="close" size={16} color={theme.colors.error} />
                          <Text style={styles.invitationDeclineText}>Avslå</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.invitationAcceptButton, isResponding && styles.buttonDisabled]}
                      onPress={() => handleInvitationResponse(invitation, true)}
                      disabled={isResponding}
                      activeOpacity={0.7}
                    >
                      {isResponding && respondingTo === invitation.id ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                      ) : (
                        <>
                          <Icon name="checkmark" size={16} color={theme.colors.white} />
                          <Text style={styles.invitationAcceptText}>Bli med!</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MyRegistrations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Mine påmeldinger</Text>
              <Text style={styles.quickActionSubtitle}>
                {registrations.length === 0 
                  ? 'Ingen påmeldinger'
                  : `${registrations.length} aktivitet${registrations.length !== 1 ? 'er' : ''}`
                }
              </Text>
            </View>
            {registrations.length > 0 && (
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{registrations.length}</Text>
              </View>
            )}
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Calendar - Compact */}
        <View style={styles.calendarSection}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: theme.colors.primary,
              },
            }}
            theme={{
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textTertiary,
              dotColor: theme.colors.primary,
              selectedDotColor: theme.colors.white,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontWeight: '600',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
            hideExtraDays={true}
            enableSwipeMonths={true}
            firstDay={1}
          />
        </View>

        {/* Activities for Selected Date - Compact List */}
        <View style={styles.activitiesSection}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {new Date(selectedDate).toLocaleDateString('nb-NO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </Text>
            {selectedActivities.length > 0 && (
              <View style={styles.activityCountBadge}>
                <Text style={styles.activityCountText}>{selectedActivities.length}</Text>
              </View>
            )}
          </View>
          {selectedActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {selectedActivities.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id || index}
                  style={styles.activityCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ActivityDetail', { activity })}
                >
                  <View style={styles.activityTimeColumn}>
                    {activity.time && !activity.multiDay && (
                      <Text style={styles.activityTime}>{activity.time.split('-')[0]}</Text>
                    )}
                    {activity.multiDay && (
                      <View style={styles.multiDayIndicator} />
                    )}
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                      {activity.type && (
                        <View style={[styles.activityTypeBadge, { backgroundColor: getActivityTypeColor(activity.type) + '20' }]}>
                          <Text style={[styles.activityType, { color: getActivityTypeColor(activity.type) }]}>{activity.type}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.activityDetails}>
                      {activity.time && !activity.multiDay && (
                        <View style={styles.activityDetailRow}>
                          <Icon name="time-outline" size={12} color={theme.colors.textTertiary} />
                          <Text style={styles.activityDetailText}>{activity.time}</Text>
                        </View>
                      )}
                      {activity.location && activity.location !== 'Har ikke sted' && activity.location !== 'Ikke oppgitt' && (
                        <View style={styles.activityDetailRow}>
                          <Icon name="location-outline" size={12} color={theme.colors.textTertiary} />
                          <Text style={styles.activityDetailText} numberOfLines={1}>{activity.location}</Text>
                        </View>
                      )}
                      {activity.registrationCount > 0 && (
                        <View style={styles.activityDetailRow}>
                          <Icon name="people-outline" size={12} color={theme.colors.primary} />
                          <Text style={[styles.activityDetailText, { color: theme.colors.primary }]}>
                            {activity.registrationCount} påmeldt{activity.registrationCount !== 1 ? 'e' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Icon name="calendar-outline" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>
                {activities.length === 0 
                  ? 'Ingen aktiviteter ennå'
                  : 'Ingen aktiviteter denne dagen'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activities.length === 0 
                  ? 'Kalenderen har ikke blitt satt opp ennå, eller det er ingen kommende aktiviteter. Dra ned for å oppdatere.'
                  : 'Velg en annen dato i kalenderen for å se aktiviteter, eller sjekk kommende arrangementer nedenfor.'}
              </Text>
              {activities.length === 0 && (
                <>
                  <TouchableOpacity 
                    style={styles.forceRefreshButton}
                    onPress={async () => {
                      setRefreshing(true);
                      await clearDataCache();
                      setRefreshing(false);
                    }}
                  >
                    <Icon name="refresh-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.forceRefreshText}>Oppdater kalenderen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.openCalendarButton}
                    onPress={handleCalendarPress}
                  >
                    <Icon name="open-outline" size={16} color={theme.colors.white} />
                    <Text style={styles.openCalendarText}>Åpne Google Kalender</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* Upcoming Major Events - Compact */}
        {activities.filter((a) => a.multiDay || a.type === 'Arrangement').length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsHeaderText}>Kommende arrangementer</Text>
            </View>
            <View style={styles.eventsList}>
              {activities.filter((a) => a.multiDay || a.type === 'Arrangement').map(
                (activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.eventCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ActivityDetail', { activity })}
                  >
                    <View style={styles.eventDateColumn}>
                      <Text style={styles.eventDay}>
                        {new Date(activity.date).toLocaleDateString('nb-NO', { day: 'numeric' })}
                      </Text>
                      <Text style={styles.eventMonth}>
                        {new Date(activity.date).toLocaleDateString('nb-NO', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle} numberOfLines={1}>{activity.title}</Text>
                      <Text style={styles.eventDate}>
                        {new Date(activity.date).toLocaleDateString('nb-NO', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                        {activity.endDate && ` - ${new Date(activity.endDate).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}`}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  quickActionSubtitle: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  quickActionBadge: {
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  quickActionBadgeText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },
  
  // Calendar Section - Compact
  calendarSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  calendar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    ...theme.shadows.small,
  },
  
  // Activities Section - Compact List
  activitiesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  dateHeaderText: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  activityCountBadge: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  activityCountText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  activitiesList: {
    gap: theme.spacing.xs,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  activityTimeColumn: {
    width: 50,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  activityTime: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  multiDayIndicator: {
    width: 4,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs / 2,
    gap: theme.spacing.xs,
  },
  activityTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  activityTypeBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs / 2,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  activityDetailText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  forceRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  forceRefreshText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  openCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
  },
  openCalendarText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '700',
  },
  
  // Events Section - Compact
  eventsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  eventsHeader: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  eventsHeaderText: {
    ...theme.typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  eventsList: {
    gap: theme.spacing.xs,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  eventDateColumn: {
    width: 44,
    alignItems: 'center',
    paddingRight: theme.spacing.sm,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
  },
  eventDay: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    lineHeight: 24,
  },
  eventMonth: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  eventContent: {
    flex: 1,
    paddingLeft: theme.spacing.md,
  },
  eventTitle: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs / 2,
  },
  eventDate: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },

  // Invitations Section
  invitationsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  invitationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  invitationsHeaderText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  invitationsBadge: {
    backgroundColor: theme.colors.info,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  invitationsBadgeText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },
  invitationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.info + '30',
    ...theme.shadows.small,
  },
  invitationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  invitationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  invitationAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  invitationInfo: {
    flex: 1,
  },
  invitationSender: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  invitationText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  invitationActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  invitationActivityInfo: {
    flex: 1,
  },
  invitationActivityTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 15,
  },
  invitationActivityDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  invitationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  invitationMessageText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 20,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  invitationDeclineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.error + '15',
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  invitationDeclineText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  invitationAcceptButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.success,
  },
  invitationAcceptText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
