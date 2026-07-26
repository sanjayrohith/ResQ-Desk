import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Radio, Target, Map as MapIcon } from 'lucide-react-native';
import { colors, fontFamily } from '../theme';
import { CommsScreen } from '../screens/CommsScreen';
import { IncidentScreen } from '../screens/IncidentScreen';
import { MapScreen } from '../screens/MapScreen';
import { Header } from '../components/dashboard/Header';
import { BottomStatusBar } from '../components/dashboard/StatusBar';
import { DispatchPopup } from '../components/dashboard/DispatchPopup';
import { useIncident } from '../api/IncidentContext';

const Tab = createBottomTabNavigator();

export function RootTabs() {
  const { incidentData, showPopup, resetDashboard } = useIncident();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0c0c0b',
            borderTopColor: 'rgba(42,42,39,0.5)',
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.cyan[400],
          tabBarInactiveTintColor: colors.slate[500],
          tabBarLabelStyle: {
            fontFamily: fontFamily.sansSemibold,
            fontSize: 10,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          },
        }}>
        <Tab.Screen
          name="Comms"
          component={CommsScreen}
          options={{
            tabBarLabel: 'Comms',
            tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Incident"
          component={IncidentScreen}
          options={{
            tabBarLabel: 'Incident',
            tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarLabel: 'Map',
            tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />,
          }}
        />
      </Tab.Navigator>

      <BottomStatusBar />

      {showPopup && <DispatchPopup data={incidentData} onCancel={resetDashboard} onComplete={resetDashboard} />}
    </View>
  );
}
