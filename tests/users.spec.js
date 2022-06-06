const supertest = require('supertest');
const server = require('../app');

const request = supertest(server);

const { pool } = require('../database/connection');

let accessToken = null;
let studentId = null;

const getAccessToken = async () => {
  try {
    const resp = await request.post('/api/users/register').send({
      email: 'integration@test.com',
      password: 'TEST_integration',
      firstName: 'fname',
      lastName: 'lname',
      dateOfBirth: '2022-04-22',
      userRole: 'TEACHER',
      classId: null
    });

    const loginResponse = await request.post('/api/users/login').send({
      email: 'integration@test.com',
      password: 'TEST_integration',
    });

    return loginResponse.body.accessToken;
  } catch (error) {
    throw new Error(error);
  }
};

const truncateTables = () => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = 'SET FOREIGN_KEY_CHECKS=0; '
          + 'TRUNCATE TABLE courses; '
          + 'TRUNCATE TABLE classes; '
          + 'TRUNCATE TABLE users; '
          + 'TRUNCATE TABLE lectures; '
          + 'TRUNCATE TABLE attendance; '
          + 'SET FOREIGN_KEY_CHECKS=1;';
    db.query(query, (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});

// CREATE testing records
const createClass = () => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const createClassQuery = `
              INSERT INTO classes (name)
              VALUES ('TEST Class');
            `;
    db.query(createClassQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

const createUser = (classId) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    let createUserQuery = '';
    if (classId) {
      createUserQuery = `
                INSERT INTO users (user_role, email, password, first_name, last_name, date_of_birth, class_id)
                VALUES ('STUDENT', 'TEST@student.com', 'TEST_password', 'TEST fname', 'TEST lname', '2022-04-22', '${classId}');
              `;
    } else {
      createUserQuery = `
                INSERT INTO users (user_role, email, password, first_name, last_name, date_of_birth)
                VALUES ('TEACHER', 'TEST@teacher.com', 'TEST_password', 'TEST fname', 'TEST lname', '2022-01-22');
              `;
    }
    db.query(createUserQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

const createCourse = () => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const createCourseQuery = `
              INSERT INTO courses (name)
              VALUES ('TEST Class');
            `;
    db.query(createCourseQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

const createLecture = (teacherId, courseId, classId) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const createLectureQuery = `
              INSERT INTO lectures (teacher_id, start_date_time, course_id, class_id)
              VALUES ('${teacherId}', '2022-03-22 13:59:59', '${courseId}', ${classId});
            `;
    db.query(createLectureQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

const createAttendance = (studentId, lectureId) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const createAttendanceQuery = `
              INSERT INTO attendance (user_id, lecture_id, is_attending)
              VALUES ('${studentId}', '${lectureId}', '1');
            `;
    db.query(createAttendanceQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

beforeAll(async () => {
  await truncateTables();

  // to test the attendance of a studSent to a specific lecture we need records in the following tables:
  // attendances which requires records in: users (as a student), lectures
  // users which requires records in: classes
  // lectures which requires records in: users (as a teacher), courses, classes

  const classId = await createClass();

  const teacherId = await createUser();

  // global variable
  studentId = await createUser(classId);

  const courseId = await createCourse();

  const lectureId = await createLecture(teacherId, courseId, classId);

  await createAttendance(studentId, lectureId);

  // global variable
  accessToken = await getAccessToken();
}, 10000);

describe('student integration tests', () => {
  test('GET /api/users/students/attendance/:studentId', async () => {
    try {
      if (accessToken) {
        const endpointResponse = await request.get(`/api/users/students/attendance/${studentId}`).set({ Authorization: `Bearer ${accessToken}` });
        expect(typeof endpointResponse.body).toBe('object');
        expect(endpointResponse.statusCode).toBe(200);
        expect(endpointResponse.body.firstName).toBe('TEST fname');
        expect(endpointResponse.body.lastName).toBe('TEST lname');
        expect(endpointResponse.body['TEST Class']).toBe('100.00');
      }
    } catch (error) {
      throw new Error(error);
    }
  }, 10000);

  afterAll(async () => {
    await truncateTables();
    pool.end();
  });
});
