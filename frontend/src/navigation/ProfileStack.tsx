import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { UserChangePasswordScreen } from '@/screens/UserChangePasswordScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  UserChangePassword: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="UserChangePassword"
        component={UserChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </Stack.Navigator>
  );
}
