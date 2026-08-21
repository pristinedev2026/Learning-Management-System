import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const instructors = await prisma.user.findMany({ where: { role: 'instructor' } });
  console.log('Instructors:', instructors.map(i => ({ id: i.id, name: i.name })));

  for (const instructor of instructors) {
    const courses = await prisma.course.findMany({ where: { instructorId: instructor.id } });
    console.log(`Instructor ${instructor.name} has ${courses.length} courses`);

    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId: instructor.id }
      },
      include: {
        student: true,
        course: true
      }
    });
    console.log(`Instructor ${instructor.name} has ${enrollments.length} enrollments`);
    enrollments.forEach(e => {
        console.log(`  - Student: ${e.student.name} in Course: ${e.course.title}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
