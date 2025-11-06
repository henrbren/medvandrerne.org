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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { SAMPLE_ACTIVITIES } from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function ActivitiesScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const markedDates = {};
  SAMPLE_ACTIVITIES.forEach((activity) => {
    markedDates[activity.date] = {
      marked: true,
      dotColor: theme.colors.primary,
      selected: selectedDate === activity.date,
      selectedColor: theme.colors.primary,
    };
  });

  const getActivitiesForDate = (date) => {
    return SAMPLE_ACTIVITIES.filter((activity) => {
      if (activity.multiDay) {
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

  const handleCalendarPress = () => {
    Linking.openURL('https://www.google.com/calendar/embed?color=%23ffad46&src=medvandrerne.org_2ht93gv6gho6qdo7sft8h60a2c@group.calendar.google.com');
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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb,
        ]}
      >
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Calendar Link Section */}
        <View style={styles.calendarLinkSection}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.headerIconGradient}
            >
              <Icon name="calendar" size={32} color={theme.colors.white} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Aktivitetskalender</Text>
          </View>
          <Text style={styles.description}>
            Se alle aktiviteter i vår Google Kalender
          </Text>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleCalendarPress}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryCTAGradient}
            >
              <View style={styles.ctaIconContainer}>
                <Icon name="calendar" size={28} color={theme.colors.white} />
              </View>
              <Text style={styles.ctaText}>Åpne kalender</Text>
              <Icon name="arrow-forward" size={24} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
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
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 17,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Activities for Selected Date */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Icon name="time" size={28} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          {selectedActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {selectedActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primaryLight]}
                      style={styles.activityIconGradient}
                    >
                      <Icon
                        name={getActivityIcon(activity.type)}
                        size={28}
                        color={theme.colors.white}
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View style={styles.activityMeta}>
                      <View style={styles.activityBadge}>
                        <Text style={styles.activityType}>{activity.type}</Text>
                      </View>
                      <Text style={styles.activityTime}>
                        {activity.multiDay
                          ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                          : activity.time}
                      </Text>
                    </View>
                    {activity.location !== 'Har ikke sted' && (
                      <View style={styles.activityLocation}>
                        <Icon name="location" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.activityLocationText}>{activity.location}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>
                Ingen aktiviteter planlagt for denne dagen
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Major Events */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="trophy" size={28} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Kommende arrangementer</Text>
          </View>
          <View style={styles.eventsList}>
            {SAMPLE_ACTIVITIES.filter((a) => a.multiDay || a.type === 'Arrangement').map(
              (activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.eventCard}
                  activeOpacity={0.7}
                >
                  <View style={[styles.eventIconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Icon name="trophy" size={24} color={theme.colors.warning} />
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{activity.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDate(activity.date)}
                      {activity.endDate && ` - ${formatDate(activity.endDate)}`}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  topSpacer: {
    height: theme.spacing.xl,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowSubtle,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 26,
  },
  
  // Calendar Link Section
  calendarLinkSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  primaryCTA: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  primaryCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    flex: 1,
  },
  
  // Calendar Section
  calendarSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  calendar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  
  // Activities Section
  activitiesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  activitiesList: {
    gap: theme.spacing.lg,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  activityIconContainer: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIconGradient: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  activityBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  activityTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  activityLocationText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  
  // Events Section
  eventsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  eventsList: {
    gap: theme.spacing.md,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  eventIconContainer: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  eventDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});
