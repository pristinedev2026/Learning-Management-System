import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AuthStack } from '@/navigation/AuthStack';
import { StudentTabs } from '@/navigation/StudentTabs';
import { InstructorTabs } from '@/navigation/InstructorTabs';
import { AdminTabs } from '@/navigation/AdminTabs';
import { ChangePasswordScreen } from '@/screens/auth/ChangePasswordScreen';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeContext';
import { linking } from '@/navigation/linking';

export function RootNavigator() {
  const { user, isHydrating, hydrate } = useAuthStore();
  const { colors, isDark } = useTheme();

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.ink,
      border: colors.border,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.ink,
      border: colors.border,
    },
  };

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // A user who was just reset (or force-flagged) by an admin is held here —
  // no role-based screens render — until they set their own new password.
  const content = !user ? (
    <AuthStack />
  ) : user.mustChangePassword ? (
    <ChangePasswordScreen />
  ) : user.role === 'student' ? (
    <StudentTabs />
  ) : user.role === 'instructor' ? (
    <InstructorTabs />
  ) : (
    <AdminTabs />
  );

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      {content}
    </NavigationContainer>
  );
}
