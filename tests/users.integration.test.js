const server = require("../app");
const supertest = require("supertest");
const request = supertest(server);

const {pool} = require('../database/connection');

const getAccessToken = async () => {
    try {
        const registerResponse = await request.post('/api/users/login').send({
          "email": "v-kane@yahoo.com",
          "password": "JmE95osSMM4bYF"
        });
        const accessToken = registerResponse._body.accessToken;
        return accessToken;
      } catch (error) {
        console.log(error);
      }
};

// CREATE testing records
const createClass = () => {
    return new Promise((resolve, reject) => { 
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
    })
};

const createUser = (classId) => {
    return new Promise((resolve, reject) => { 
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
    })
};

const createCourse = () => {
    return new Promise((resolve, reject) => { 
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
    })
};

const createLecture = (teacherId, courseId, classId) => {
    return new Promise((resolve, reject) => { 
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
    })
};

const createAttendance = (studentId, lectureId) => {
    return new Promise((resolve, reject) => { 
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
    })
};

// DELETE testing records
const deleteAttendance = (id) => {
    return new Promise((resolve, reject) => { 
        pool.getConnection((err, db) => {
            const deleteQuery = `
                DELETE FROM attendance 
                WHERE attendance_id = ${id};
            `;
            db.query(deleteQuery, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
            db.release();
        });
    })
};

const deleteLecture = (id) => {
    return new Promise((resolve, reject) => { 
        pool.getConnection((err, db) => {
            const deleteLectureQuery = `
                DELETE FROM lectures 
                WHERE lecture_id = ${id};
            `;
            db.query(deleteLectureQuery, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
            db.release();
        });
    })
};

const deleteUser = (id) => {
    return new Promise((resolve, reject) => { 
        pool.getConnection((err, db) => {
            const deleteUserQuery = `
                DELETE FROM users 
                WHERE user_id = ${id};
            `;
            db.query(deleteUserQuery, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
            db.release();
        });
    })
};

const deleteClass = (id) => {
    return new Promise((resolve, reject) => { 
        pool.getConnection((err, db) => {
            const deleteClassQuery = `
                DELETE FROM classes 
                WHERE class_id = ${id};
            `;
            db.query(deleteClassQuery, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
            db.release();
        });
    })
};

const deleteCourse = (id) => {
    return new Promise((resolve, reject) => { 
        pool.getConnection((err, db) => {
            const deleteCourseQuery = `
                DELETE FROM courses 
                WHERE course_id = ${id};
            `;
            db.query(deleteCourseQuery, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
            db.release();
        });
    })
};

describe('student integration tests', () => {
  // make it as a transaction

  test("GET /api/users/students/attendSance/:studentId", async () => {

    // to test the attendance of a studSent to a specific lecture we need records in the following tables:
    // attendances which requires records in: users (as a student), lectures
    // users which requires records in: classes
    // lectures which requires records in: users (as a teacher), courses, classes
    
    const classId = await createClass();
    // console.log(classId);

    const studentId = await createUser(classId);
    // console.log(studentId);

    const teacherId = await createUser(null);
    // console.log(teacherId)

    const courseId = await createCourse();
    // console.log(courseId)

    const lectureId = await createLecture(teacherId, courseId, classId);
    // console.log(lectureId);

    const attendanceId = await createAttendance(studentId, lectureId);
    // console.log(attendanceId);

    // create new attendance for that student
    let accessToken = await getAccessToken();
    
    try {
      if (accessToken) {
        const endpointResponse = await request.get(`/api/users/students/attendance/${studentId}`).set({Authorization: "Bearer " + accessToken});
        expect(typeof endpointResponse.body).toBe('object');
        expect(endpointResponse.statusCode).toBe(200);
        expect(endpointResponse.body.firstName).toBe('TEST fname');
        expect(endpointResponse.body.lastName).toBe('TEST lname');
        expect(endpointResponse.body['TEST Class']).toBe('100.00');
      } else {
        console.log("No access token");
      }
    } catch (error) {
      console.log(error);
    }

    await deleteAttendance(attendanceId);
    await deleteLecture(lectureId);
    await deleteUser(studentId);
    await deleteUser(teacherId);
    await deleteCourse(courseId);
    await deleteClass(classId);
  }, 40000);

  afterAll(()=> {
      pool.end();
  });

});
