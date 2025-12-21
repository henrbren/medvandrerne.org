import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';

const isWeb = Platform.OS === 'web';

export default function ActivitiesScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { data, loading, refreshData, clearDataCache } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  
  // Kombiner Google Calendar og lokale aktiviteter
  const calendarEvents = data.calendar || [];
  const localActivities = data.activities || [];
  
  // Merge og sorter alle aktiviteter
  const activities = [...calendarEvents, ...localActivities].sort((a, b) => {
    return (a.date || '').localeCompare(b.date || '');
  });
  
  // Debug: Log what we have
  console.log('ActivitiesScreen - calendar events:', calendarEvents.length);
  console.log('ActivitiesScreen - local activities:', localActivities.length);
  console.log('ActivitiesScreen - total activities:', activities.length);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };
  
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
                        <View style={[styles.activityTypeBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                          <Text style={styles.activityType}>{activity.type}</Text>
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
                      {activity.location && activity.location !== 'Har ikke sted' && (
                        <View style={styles.activityDetailRow}>
                          <Icon name="location-outline" size={12} color={theme.colors.textTertiary} />
                          <Text style={styles.activityDetailText} numberOfLines={1}>{activity.location}</Text>
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
              <Icon name="calendar-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>
                {activities.length === 0 
                  ? 'Ingen aktiviteter i kalenderen ennå.\nDra ned for å oppdatere.'
                  : 'Ingen aktiviteter denne dagen'}
              </Text>
              {activities.length === 0 && (
                <TouchableOpacity 
                  style={styles.forceRefreshButton}
                  onPress={async () => {
                    setRefreshing(true);
                    await clearDataCache();
                    setRefreshing(false);
                  }}
                >
                  <Icon name="refresh-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.forceRefreshText}>Tøm cache og oppdater</Text>
                </TouchableOpacity>
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
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontSize: 14,
  },
  forceRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  forceRefreshText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
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
});
