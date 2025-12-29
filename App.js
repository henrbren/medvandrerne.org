import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './constants/theme';
import Sidebar from './components/Sidebar';
import ProfileHeaderButton from './components/ProfileHeaderButton';
import ProfileModal from './components/modals/ProfileModal';
import { requestPermissions, registerPushToken, setupNotificationListeners, getLastNotificationResponse } from './services/notifications';
import { AppDataProvider } from './contexts/AppDataContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileModalProvider, useProfileModal } from './contexts/ProfileModalContext';

import HomeScreen from './screens/HomeScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import FlokkenScreen from './screens/FlokkenScreen';
import LocalGroupsScreen from './screens/LocalGroupsScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import PersonDetailScreen from './screens/PersonDetailScreen';
import LocalGroupDetailScreen from './screens/LocalGroupDetailScreen';
import CoreActivityDetailScreen from './screens/CoreActivityDetailScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';
import MasteryLogScreen from './screens/MasteryLogScreen';
import MyJourneyScreen from './screens/MyJourneyScreen';
import SkillsScreen from './screens/SkillsScreen';
import MilestonesScreen from './screens/MilestonesScreen';
import ExpeditionsScreen from './screens/ExpeditionsScreen';
import EnvironmentActionsScreen from './screens/EnvironmentActionsScreen';
import NewsScreen from './screens/NewsScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import MembershipScreen from './screens/MembershipScreen';
import FlokkenSettingsScreen from './screens/FlokkenSettingsScreen';
import FlokkenMapScreen from './screens/FlokkenMapScreen';
import ProfileInfoScreen from './screens/ProfileInfoScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import TripPlannerScreen from './screens/TripPlannerScreen';
import MyTripsScreen from './screens/MyTripsScreen';
import ActivityMessagesScreen from './screens/ActivityMessagesScreen';
import MyRegistrationsScreen from './screens/MyRegistrationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const isWeb = Platform.OS === 'web';

// Import web CSS
if (isWeb) {
  require('./web.css');
}

function TabNavigator({ navigationRef, currentRoute, onOpenProfile }) {
  const insets = useSafeAreaInsets();
  
  // Common header right button for profile
  const headerRight = () => (
    <ProfileHeaderButton onPress={onOpenProfile} />
  );
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
      >
        {() => (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Hjem') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Min vandring') {
                  iconName = focused ? 'map' : 'map-outline';
                } else if (route.name === 'Aktiviteter') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Flokken') {
                  iconName = focused ? 'people' : 'people-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textSecondary,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
                borderTopWidth: 1,
                height: Platform.OS === 'ios' ? 88 : 64 + insets.bottom,
                paddingBottom: Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 8),
                paddingTop: 8,
                ...theme.shadows.small,
                // Don't set display on web - let CSS handle it
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              },
              headerStyle: {
                backgroundColor: theme.colors.primary,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
                height: Platform.OS === 'ios' ? 44 + insets.top : isWeb ? 0 : 64,
              },
              headerTintColor: theme.colors.white,
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
                letterSpacing: 0.5,
              },
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerTitleContainerStyle: {
                paddingHorizontal: Platform.OS === 'ios' ? 0 : 16,
              },
              headerRight: headerRight,
            })}
          >
            <Tab.Screen 
              name="Hjem" 
              component={HomeScreen}
              options={({ route }) => ({
                headerTitle: 'Medvandrerne',
                headerStyle: {
                  backgroundColor: 'transparent',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                  height: Platform.OS === 'ios' ? 44 + insets.top : isWeb ? 0 : 64,
                },
                headerTransparent: true,
                headerBlurEffect: 'dark',
                headerRight: headerRight,
              })}
            />
            <Tab.Screen 
              name="Min vandring" 
              component={MyJourneyScreen}
              options={{
                headerTitle: 'Min vandring',
                headerRight: headerRight,
              }}
            />
            <Tab.Screen 
              name="Aktiviteter" 
              component={ActivitiesScreen}
              options={{
                headerRight: headerRight,
              }}
            />
            <Tab.Screen 
              name="Flokken" 
              component={FlokkenScreen}
              options={{
                headerTitle: 'Flokken',
                headerRight: headerRight,
              }}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="PersonDetail"
        component={PersonDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Kontaktinformasjon',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="LocalGroupDetail"
        component={LocalGroupDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Lokallag',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="CoreActivityDetail"
        component={CoreActivityDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Kjernevirksomhet',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Aktivitet',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="MasteryLog"
        component={MasteryLogScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Reisebok',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Skills"
        component={SkillsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Ferdigheter',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Milestones"
        component={MilestonesScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Alle milepæler',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Lokallag"
        component={LocalGroupsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Lokallag',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Om oss"
        component={AboutScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Om oss',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Kontakt"
        component={ContactScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Kontakt',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Expeditions"
        component={ExpeditionsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Ekspedisjoner',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="EnvironmentActions"
        component={EnvironmentActionsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Miljøaksjoner',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Nyheter',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Nyhet',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="Membership"
        component={MembershipScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Medlemskap',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="FlokkenSettings"
        component={FlokkenSettingsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Innstillinger',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="FlokkenMap"
        component={FlokkenMapScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Kart',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="ProfileInfo"
        component={ProfileInfoScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Profilinformasjon',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Innstillinger',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="TripPlanner"
        component={TripPlannerScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Planlegg tur',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Mine turer',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="ActivityMessages"
        component={ActivityMessagesScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Meldinger',
          headerRight: headerRight,
        }}
      />
      <Stack.Screen
        name="MyRegistrations"
        component={MyRegistrationsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitle: 'Tilbake',
          headerBackTitleVisible: true,
          title: 'Mine påmeldinger',
          headerRight: headerRight,
        }}
      />
    </Stack.Navigator>
  );
}

function AppWithNavigation() {
  const navigationRef = React.useRef(null);
  const [currentRoute, setCurrentRoute] = React.useState('Hjem');
  const [navigationReady, setNavigationReady] = React.useState(false);
  const [isMobileWeb, setIsMobileWeb] = React.useState(false);
  const { visible: showProfileModal, openScanner, showProfileModal: handleOpenProfile, hideProfileModal } = useProfileModal();

  // Set up notification listeners with navigation
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      // On notification received while app is in foreground
      (notification) => {
        console.log('Notification received:', notification.request.content);
      },
      // On user tap on notification
      (response) => {
        const data = response.notification.request.content.data;
        console.log('User tapped notification with data:', data);
        
        if (!navigationRef.current) return;

        // Handle different notification types
        if (data?.type === 'contact_added') {
          // Navigate to Flokken when someone adds you
          navigationRef.current.navigate('Flokken');
        } else if (data?.type === 'activity_message' && data?.activityId) {
          // Navigate to activity messages
          // First need to get the activity data
          navigationRef.current.navigate('ActivityMessages', { 
            activity: { id: data.activityId } 
          });
        } else if (data?.activityId) {
          // Default: navigate to activity detail
          navigationRef.current.navigate('ActivityDetail', {
            activity: { id: data.activityId, title: data.activityTitle }
          });
        }
      }
    );

    return cleanup;
  }, []);

  React.useEffect(() => {
    if (isWeb) {
      const checkMobile = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobileWeb(mobile);
        // Also update CSS custom property for better CSS control
        document.documentElement.style.setProperty('--is-mobile', mobile ? '1' : '0');
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      // Also check on orientation change
      window.addEventListener('orientationchange', checkMobile);
      return () => {
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('orientationchange', checkMobile);
      };
    }
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setNavigationReady(true)}
      onStateChange={() => {
        const route = navigationRef.current?.getCurrentRoute()?.name || 'Hjem';
        setCurrentRoute(route);
      }}
    >
      <View style={styles.appContainer}>
        {isWeb && !isMobileWeb && navigationReady && navigationRef.current && (
          <Sidebar 
            navigation={navigationRef.current} 
            currentRoute={currentRoute}
            onOpenProfile={() => handleOpenProfile()}
          />
        )}
        <View style={[
          styles.contentContainer, 
          isWeb && !isMobileWeb && styles.webContentContainer
        ]}>
          <TabNavigator 
            navigationRef={navigationRef} 
            currentRoute={currentRoute} 
            onOpenProfile={() => handleOpenProfile()}
          />
        </View>
      </View>
      
      {/* Profile Modal - accessible from all screens */}
      <ProfileModal 
        visible={showProfileModal}
        onClose={hideProfileModal}
        navigation={navigationRef.current}
        initialOpenScanner={openScanner}
      />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start (skip on web)
    if (Platform.OS !== 'web') {
      requestPermissions()
        .then(() => {
          // Register push token after permissions granted
          return registerPushToken();
        })
        .catch((error) => {
          console.error('Error setting up notifications:', error);
        });
    }
  }, []);


  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <AuthProvider>
          <ProfileModalProvider>
            <StatusBar style="light" backgroundColor={theme.colors.primary} />
            <AppWithNavigation />
          </ProfileModalProvider>
        </AuthProvider>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: theme.colors.background,
    ...(isWeb && {
      flexDirection: 'row',
    }),
  },
  contentContainer: {
    flex: 1,
  },
  webContentContainer: {
    marginLeft: 300,
    width: 'calc(100% - 300px)',
    maxWidth: 'none',
  },
});

