import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminUsersScreen } from '@/screens/admin/AdminUsersScreen';
import { AdminUserDetailScreen } from '@/screens/admin/AdminUserDetailScreen';

export type AdminStackParamList = {
  AdminUsers: undefined;
  AdminUserDetail: { userId: string };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen
        name="AdminUserDetail"
        component={AdminUserDetailScreen}
        options={{ headerShown: true, title: 'Manage user' }}
      />
    </Stack.Navigator>
  );
}
