import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { SAMPLE_ACTIVITIES } from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function ActivitiesScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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
        return 'people-outline';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar-outline';
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
        {/* Calendar Link Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Aktivitetskalender</Text>
          </View>
          <Text style={styles.text}>
            Se alle aktiviteter i vår Google Kalender
          </Text>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleCalendarPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.primaryLight, theme.colors.gradientLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.calendarButtonGradient}
            >
              <View style={styles.buttonIconContainer}>
                <Icon name="calendar-outline" size={22} color={theme.colors.white} />
              </View>
              <Text style={styles.buttonText}>Åpne kalender</Text>
              <View style={styles.buttonArrow}>
                <Icon name="chevron-forward-outline" size={20} color={theme.colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
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
              textDisabledColor: theme.colors.border,
              dotColor: theme.colors.primary,
              selectedDotColor: theme.colors.white,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Activities for Selected Date */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="time" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>
              Aktiviteter {selectedDate && formatDate(selectedDate)}
            </Text>
          </View>
          {selectedActivities.length > 0 ? (
            selectedActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                activeOpacity={0.7}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
                      style={styles.activityIconGradient}
                    >
                      <Icon
                        name={getActivityIcon(activity.type)}
                        size={24}
                        color={theme.colors.primary}
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.activityHeaderText}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View style={styles.activityTypeBadge}>
                      <Text style={styles.activityType}>{activity.type}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.activityDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="time-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {activity.multiDay
                        ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                        : activity.time}
                    </Text>
                  </View>
                  {activity.location !== 'Har ikke sted' && (
                    <View style={styles.detailRow}>
                      <Icon name="location-outline" size={18} color={theme.colors.textSecondary} />
                      <Text style={styles.detailText}>{activity.location}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyStateText}>
                Ingen aktiviteter planlagt for denne dagen
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Major Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="trophy" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Kommende større arrangementer</Text>
          </View>
          {SAMPLE_ACTIVITIES.filter((a) => a.multiDay || a.type === 'Arrangement').map(
            (activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.eventCard}
                activeOpacity={0.7}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
                      style={styles.eventIconGradient}
                    >
                      <Icon name="trophy" size={20} color={theme.colors.primary} />
                    </LinearGradient>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{activity.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDate(activity.date)}
                      {activity.endDate && ` - ${formatDate(activity.endDate)}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          )}
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: isWeb ? theme.web.cardGap : theme.spacing.lg,
    padding: isWeb ? theme.spacing.xxl : theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    ...theme.shadows.large,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...(isWeb && {
      width: '100%',
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  calendarButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.xl,
    ...theme.shadows.glow,
  },
  calendarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonIconContainer: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonArrow: {
    marginLeft: theme.spacing.sm,
  },
  calendar: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  activityCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: isWeb ? theme.spacing.xl : theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isWeb && {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  activityIconContainer: {
    marginRight: theme.spacing.md,
  },
  activityIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  activityHeaderText: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  activityTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  activityDetails: {
    marginTop: theme.spacing.xs,
    paddingLeft: 52,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: isWeb ? theme.spacing.xl : theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isWeb && {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIconContainer: {
    marginRight: theme.spacing.md,
  },
  eventIconGradient: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  eventDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});
