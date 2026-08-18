import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseCatalogScreen } from '@/screens/student/CourseCatalogScreen';
import { CourseDetailScreen } from '@/screens/student/CourseDetailScreen';
import { LessonViewerScreen } from '@/screens/student/LessonViewerScreen';
import { AssignmentDetailScreen } from '@/screens/student/AssignmentDetailScreen';
import { SubmissionScreen } from '@/screens/student/SubmissionScreen';
import { QuizTakerScreen } from '@/screens/student/QuizTakerScreen';
import { QuizResultsScreen } from '@/screens/student/QuizResultsScreen';
import { CourseAnnouncementsScreen } from '@/screens/student/CourseAnnouncementsScreen';
import { CourseDiscussionsScreen } from '@/screens/student/CourseDiscussionsScreen';
import { MyCoursesScreen } from '@/screens/student/MyCoursesScreen';
import { GradesScreen } from '@/screens/student/GradesScreen';
import { AchievementsScreen } from '@/screens/student/AchievementsScreen';
import { CalendarScreen } from '@/screens/student/CalendarScreen';
import { NotificationsScreen } from '@/screens/student/NotificationsScreen';
import { MessagesStack } from '@/navigation/MessagesStack';
import { ProfileStack } from '@/navigation/ProfileStack';
import { colors } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { Lesson, Assignment, Quiz, QuizAttempt, Submission } from '@/types';

export type StudentCatalogStackParamList = {
  CourseCatalog: undefined;
  CourseDetail: { courseId: string };
  Lesson: {
    lesson: Lesson;
    moduleId: string;
    courseId: string;
    allLessonsInModule: Lesson[];
  };
  AssignmentDetail: {
    assignment: Assignment;
    courseId: string;
  };
  Submission: {
    assignment: Assignment;
    courseId: string;
    existingSubmission?: Submission;
  };
  QuizTaker: {
    quiz: Quiz;
    courseId: string;
  };
  QuizResults: {
    quizAttempt: QuizAttempt;
    quiz: Quiz;
    courseId: string;
  };
  CourseAnnouncements: { courseId: string };
  CourseDiscussions: { courseId: string };
};

const CatalogStackNav = createNativeStackNavigator<StudentCatalogStackParamList>();
function CatalogStack() {
  return (
    <CatalogStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStackNav.Screen name="CourseCatalog" component={CourseCatalogScreen} />
      <CatalogStackNav.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ headerShown: true, title: '' }}
      />
      <CatalogStackNav.Screen
        name="Lesson"
        component={LessonViewerScreen}
        options={{ headerShown: true, title: 'Lesson' }}
      />
      <CatalogStackNav.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{ headerShown: true, title: 'Assignment' }}
      />
      <CatalogStackNav.Screen
        name="Submission"
        component={SubmissionScreen}
        options={{ headerShown: true, title: 'Submit' }}
      />
      <CatalogStackNav.Screen
        name="QuizTaker"
        component={QuizTakerScreen}
        options={{ headerShown: true, title: 'Quiz' }}
      />
      <CatalogStackNav.Screen
        name="QuizResults"
        component={QuizResultsScreen}
        options={{ headerShown: true, title: 'Results' }}
      />
      <CatalogStackNav.Screen
        name="CourseAnnouncements"
        component={CourseAnnouncementsScreen}
        options={{ headerShown: true, title: 'Announcements' }}
      />
      <CatalogStackNav.Screen
        name="CourseDiscussions"
        component={CourseDiscussionsScreen}
        options={{ headerShown: true, title: 'Discussions' }}
      />
    </CatalogStackNav.Navigator>
  );
}

export type StudentTabParamList = {
  Catalog: undefined;
  MyCourses: undefined;
  Achievements: undefined;
  Messages: undefined;
  Calendar: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

export function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Catalog') iconName = 'search-outline';
          else if (route.name === 'MyCourses') iconName = 'book-outline';
          else if (route.name === 'Achievements') iconName = 'trophy-outline';
          else if (route.name === 'Messages') iconName = 'chatbubbles-outline';
          else if (route.name === 'Calendar') iconName = 'calendar-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Catalog" component={CatalogStack} options={{ title: 'Explore' }} />
      <Tab.Screen name="MyCourses" component={MyCoursesScreen} options={{ title: 'My Courses' }} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Awards' }} />
      <Tab.Screen name="Messages" component={MessagesStack} options={{ title: 'Chat' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
