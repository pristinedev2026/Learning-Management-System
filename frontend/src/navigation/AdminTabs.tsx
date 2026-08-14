import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminStack } from '@/navigation/AdminStack';
import { ProfileStack } from '@/navigation/ProfileStack';
import { colors } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export type AdminTabParamList = {
  Users: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Users') iconName = 'people-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Users" component={AdminStack} options={{ title: 'Users' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
