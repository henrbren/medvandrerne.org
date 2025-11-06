import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './constants/theme';
import Sidebar from './components/Sidebar';

import HomeScreen from './screens/HomeScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import LocalGroupsScreen from './screens/LocalGroupsScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import PersonDetailScreen from './screens/PersonDetailScreen';
import LocalGroupDetailScreen from './screens/LocalGroupDetailScreen';
import CoreActivityDetailScreen from './screens/CoreActivityDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const isWeb = Platform.OS === 'web';

// Import web CSS
if (isWeb) {
  require('./web.css');
}

function TabNavigator({ navigationRef, currentRoute }) {
  const insets = useSafeAreaInsets();
  
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
                } else if (route.name === 'Aktiviteter') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Lokallag') {
                  iconName = focused ? 'people' : 'people-outline';
                } else if (route.name === 'Om oss') {
                  iconName = focused ? 'information-circle' : 'information-circle-outline';
                } else if (route.name === 'Kontakt') {
                  iconName = focused ? 'call' : 'call-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textSecondary,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
                borderTopWidth: 1,
                height: Platform.OS === 'ios' ? 88 : 64,
                paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                paddingTop: 8,
                ...theme.shadows.small,
                ...(isWeb && {
                  display: 'none',
                }),
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
                ...(isWeb && {
                  display: 'none',
                }),
              },
              headerTintColor: theme.colors.white,
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
                letterSpacing: 0.5,
              },
              headerShadowVisible: false,
            })}
          >
            <Tab.Screen 
              name="Hjem" 
              component={HomeScreen}
              options={{
                headerTitle: 'Medvandrerne',
              }}
            />
            <Tab.Screen name="Aktiviteter" component={ActivitiesScreen} />
            <Tab.Screen name="Lokallag" component={LocalGroupsScreen} />
            <Tab.Screen name="Om oss" component={AboutScreen} />
            <Tab.Screen name="Kontakt" component={ContactScreen} />
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
          title: 'Kontaktinformasjon',
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
          title: 'Lokallag',
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
          title: 'Kjernevirksomhet',
        }}
      />
    </Stack.Navigator>
  );
}

function AppWithNavigation() {
  const navigationRef = React.useRef(null);
  const [currentRoute, setCurrentRoute] = React.useState('Hjem');
  const [navigationReady, setNavigationReady] = React.useState(false);

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
        {isWeb && navigationReady && navigationRef.current && (
          <Sidebar navigation={navigationRef.current} currentRoute={currentRoute} />
        )}
        <View style={[styles.contentContainer, isWeb && styles.webContentContainer]}>
          <TabNavigator navigationRef={navigationRef} currentRoute={currentRoute} />
        </View>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <AppWithNavigation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: isWeb ? 'row' : 'column',
    backgroundColor: theme.colors.background,
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

