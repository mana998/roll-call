const supertest = require('supertest');
const server = require('../app');

const { pool } = require('../database/connection');

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

describe('teacherStatistics test', () => {
  test('POST /api/users/teachers/attendance/:teacherId correct', async () => {
    await insertInitialData();
    const class_id = 1;
    const course_id = 1;
    const teacherId = 1;
    let accessToken = '';
    try {
      const registerResponse = await supertest(server).post('/api/users/login').send({
        email: 'v-kane@yahoo.com',
        password: 'JmE95osSMM4bYF'
      });
      accessToken = registerResponse._body.accessToken;
      if (accessToken) {
        await supertest(server).post(`/api/users/teachers/attendance/${teacherId}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ data: { class_id, course_id } })
          .expect(200)
          .then((response) => {
            expect((response.body)).toBeTruthy();
            expect(response.body.classAttendance).toEqual('50.00');
            expect(response.body.monthlyAttendance).toEqual('0.00');
            expect(response.body.weeklyAttendance).toEqual('0.00');
            expect(response.body.studentsAttendance['bodom9915@yahoo.net'].firstName).toEqual('Brenden');
            expect(response.body.studentsAttendance['bodom9915@yahoo.net'].lastName).toEqual('Odom');
            expect(response.body.studentsAttendance['bodom9915@yahoo.net'].attendance).toEqual('50.00');
            expect(response.body.studentsAttendance['m-mckay5458@yahoo.net'].firstName).toEqual('Mira');
            expect(response.body.studentsAttendance['m-mckay5458@yahoo.net'].lastName).toEqual('Mckay');
            expect(response.body.studentsAttendance['m-mckay5458@yahoo.net'].attendance).toEqual('50.00');
          })
          .catch((e) => {
            throw e.stack;
          });
      } else {
        throw ('Failed to obtain access token');
      }
    } catch (error) {
      throw (error);
    } finally {
      await truncateTables();
    }
  }, 20000);

  const testsFail = [
    {
      args: {
        teacherId: 0,
        class_id: 1,
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: 0,
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: 1,
        course_id: 0,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 'string',
        class_id: 1,
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: 'string',
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: 1,
        course_id: 'string',
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: null,
        class_id: 1,
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: null,
        course_id: 1,
      },
      expected: 'Something went wrong'
    },
    {
      args: {
        teacherId: 1,
        class_id: 1,
        course_id: null,
      },
      expected: 'Something went wrong'
    },
  ];
  testsFail.forEach(({ args, expected }) => {
    test(`POST /api/users/teachers/attendance/:teacherId fail with args ${args} expect ${expected}`, async () => {
      await insertInitialData();
      let accessToken = '';
      try {
        const registerResponse = await supertest(server).post('/api/users/login').send({
          email: 'v-kane@yahoo.com',
          password: 'JmE95osSMM4bYF'
        });
        accessToken = registerResponse._body.accessToken;
        if (accessToken) {
          await supertest(server).post(`/api/users/teachers/attendance/${args.teacherId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send({ data: { class_id: args.class_id, course_id: args.course_id } })
            .expect(200)
            .then((response) => {
              expect((response.body)).toBeTruthy();
              expect(response.body.message).toEqual(expected);
            })
            .catch((e) => {
              throw e.stack;
            });
        } else {
          throw ('Failed to obtain access token');
        }
      } catch (error) {
        throw (error);
      } finally {
        await truncateTables();
      }
    }, 20000);
  });

  afterAll(() => {
    pool.end();
  });
});

async function insertInitialData() {
  await addClass(1, 'SD22w');
  await addUser(1, 'Kane', 'Vasquez', 'v-kane@yahoo.com', 'TEACHER', '$2b$15$PGfdEXxNY2M.OSsh1mjIFuy9Tg32Z3Cc5QkKPGIW5f.DNVXpGYwOa', '', '1980-05-29');
  await addUser(7, 'Brenden', 'Odom', 'bodom9915@yahoo.net', 'STUDENT', '$2b$15$PGfdEXxNY2M.OSsh1mjIFuy9Tg32Z3Cc5QkKPGIW5f.DNVXpGYwOa', 1, '2000-05-29');
  await addUser(8, 'Mira', 'Mckay', 'm-mckay5458@yahoo.net', 'STUDENT', '$2b$15$PGfdEXxNY2M.OSsh1mjIFuy9Tg32Z3Cc5QkKPGIW5f.DNVXpGYwOa', 1, '2000-05-29');
  await addCourse(1, 'Development of Large Systems');
  await addLecture(1, 1, 1, 1, '2022-03-03 8:30:00');
  await addLecture(2, 1, 1, 1, '2022-03-03 9:15:00');
  await addLecture(3, 1, 1, 1, '2022-03-03 10:00:00');
  await addLecture(4, 1, 1, 1, '2022-03-03 10:45:00');
  await addAttendance(7, 1, 1);
  await addAttendance(7, 2, 1);
  await addAttendance(7, 3, 0);
  await addAttendance(7, 4, 0);
  await addAttendance(8, 1, 0);
  await addAttendance(8, 2, 0);
  await addAttendance(8, 3, 1);
  await addAttendance(8, 4, 1);
}

const addUser = (userId, firstName, lastName, email, userRole, password, classId, dateOfBirth) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    let params = [userId, firstName, lastName, email, userRole, password, classId, dateOfBirth];
    let query = `INSERT INTO users (user_id, first_name, last_name, email, user_role, password, class_id, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    if (!classId) {
      query = `INSERT INTO users (user_id, first_name, last_name, email, user_role, password, class_id, date_of_birth)
            VALUES (?, ?, ?, ?, ?, ?, NULL, ?);`;
      params = [userId, firstName, lastName, email, userRole, password, dateOfBirth];
    }
    db.query(query, params, (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});

const addClass = (classId, className) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = `INSERT INTO classes (class_id, name) 
                VALUES(?, ?);`;
    db.query(query, [classId, className], (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});

const addCourse = (courseId, coursName) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = `INSERT INTO courses (course_id, name) 
            VALUES(?, ?);`;
    db.query(query, [courseId, coursName], (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});

const addLecture = (lectureId, teacherId, courseId, classId, startDateTime) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = `INSERT INTO lectures (lecture_id, course_id, teacher_id, start_date_time, class_id)
            VALUES(?, ?, ?, ?, ?);`;
    db.query(query, [lectureId, teacherId, courseId, startDateTime, classId], (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});

const addAttendance = (studentId, lectureId, isAttending) => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = `INSERT INTO attendance (user_id, lecture_id, is_attending)
            VALUES(?, ?, ?);`;
    db.query(query, [studentId, lectureId, isAttending], (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
    db.release();
  });
});
