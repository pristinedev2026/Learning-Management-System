import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'lms://'],
  config: {
    screens: {
      Catalog: {
        screens: {
          CourseDetail: 'course/:courseId',
          Lesson: 'course/:courseId/lesson/:lessonId',
        },
      },
      MyCourses: 'my-courses',
      Messages: {
        screens: {
          Chat: 'chat/:userId',
        },
      },
      Profile: 'profile',
    },
  },
};
