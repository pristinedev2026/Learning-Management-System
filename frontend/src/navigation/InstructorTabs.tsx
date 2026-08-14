import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/instructor/DashboardScreen';
import { CourseListScreen } from '@/screens/instructor/CourseListScreen';
import { CourseEditorScreen } from '@/screens/instructor/CourseEditorScreen';
import { InstructorCourseDetailScreen } from '@/screens/instructor/InstructorCourseDetailScreen';
import { ModuleEditorScreen } from '@/screens/instructor/ModuleEditorScreen';
import { LessonEditorScreen } from '@/screens/instructor/LessonEditorScreen';
import { InstructorAssignmentEditorScreen } from '@/screens/instructor/InstructorAssignmentEditorScreen';
import { InstructorQuizEditorScreen } from '@/screens/instructor/InstructorQuizEditorScreen';
import { InstructorSubmissionsScreen } from '@/screens/instructor/InstructorSubmissionsScreen';
import { InstructorGradingScreen } from '@/screens/instructor/InstructorGradingScreen';
import { PostAnnouncementScreen } from '@/screens/instructor/PostAnnouncementScreen';
import { ProfileStack } from '@/navigation/ProfileStack';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { colors } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { Course, Module, Lesson, Assignment, Quiz, Submission } from '@/types';

export type InstructorCoursesStackParamList = {
  CourseList: undefined;
  CourseEditor: {
    mode: 'create' | 'edit';
    course?: Course;
  };
  CourseDetail: {
    courseId: string;
    mode: 'edit';
  };
  ModuleEditor: {
    courseId: string;
    mode: 'create' | 'edit';
    module?: Module;
  };
  LessonEditor: {
    courseId: string;
    moduleId: string;
    mode: 'create' | 'edit';
    lesson?: Lesson;
  };
  AssignmentEditor: {
    courseId: string;
    mode: 'create' | 'edit';
    assignment?: Assignment;
  };
  QuizEditor: {
    courseId: string;
    mode: 'create' | 'edit';
    quiz?: Quiz;
  };
  PostAnnouncement: { courseId: string };
};

export type InstructorSubmissionsStackParamList = {
  SubmissionsInbox: undefined;
  Grading: {
    submission: Submission;
    assignmentTitle: string;
    studentName: string;
  };
};

export type InstructorTabParamList = {
  Dashboard: undefined;
  Courses: undefined;
  Submissions: undefined;
  Roster: undefined;
  Profile: undefined;
};

const CoursesStackNav = createNativeStackNavigator<InstructorCoursesStackParamList>();
function CoursesStack() {
  return (
    <CoursesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CoursesStackNav.Screen name="CourseList" component={CourseListScreen} />
      <CoursesStackNav.Screen
        name="CourseEditor"
        component={CourseEditorScreen}
        options={{ headerShown: true, title: 'Course' }}
      />
      <CoursesStackNav.Screen
        name="CourseDetail"
        component={InstructorCourseDetailScreen}
        options={{ headerShown: true, title: 'Manage Course' }}
      />
      <CoursesStackNav.Screen
        name="ModuleEditor"
        component={ModuleEditorScreen}
        options={{ headerShown: true, title: 'Module' }}
      />
      <CoursesStackNav.Screen
        name="LessonEditor"
        component={LessonEditorScreen}
        options={{ headerShown: true, title: 'Lesson' }}
      />
      <CoursesStackNav.Screen
        name="AssignmentEditor"
        component={InstructorAssignmentEditorScreen}
        options={{ headerShown: true, title: 'Assignment' }}
      />
      <CoursesStackNav.Screen
        name="QuizEditor"
        component={InstructorQuizEditorScreen}
        options={{ headerShown: true, title: 'Quiz' }}
      />
      <CoursesStackNav.Screen
        name="PostAnnouncement"
        component={PostAnnouncementScreen}
        options={{ headerShown: true, title: 'Post Announcement' }}
      />
    </CoursesStackNav.Navigator>
  );
}

const SubmissionsStackNav = createNativeStackNavigator<InstructorSubmissionsStackParamList>();
function SubmissionsStack() {
  return (
    <SubmissionsStackNav.Navigator>
      <SubmissionsStackNav.Screen
        name="SubmissionsInbox"
        component={InstructorSubmissionsScreen}
        options={{ title: 'Submissions' }}
      />
      <SubmissionsStackNav.Screen
        name="Grading"
        component={InstructorGradingScreen}
        options={{ title: 'Grade Submission' }}
      />
    </SubmissionsStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator<InstructorTabParamList>();

export function InstructorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = 'stats-chart-outline';
          else if (route.name === 'Courses') iconName = 'library-outline';
          else if (route.name === 'Submissions') iconName = 'clipboard-outline';
          else if (route.name === 'Roster') iconName = 'people-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Courses" component={CoursesStack} options={{ title: 'Courses' }} />
      <Tab.Screen name="Submissions" component={SubmissionsStack} options={{ title: 'Grading' }} />
      <Tab.Screen name="Roster" options={{ title: 'Roster' }}>
        {() => (
          <PlaceholderScreen
            title="Class Roster & Gradebook"
            note="Per-student progress and grades — build step 7."
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
