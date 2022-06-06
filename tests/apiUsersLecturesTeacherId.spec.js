const supertest = require('supertest');
const server = require('../app');
const { formatDate } = require('./helperMethods');
const { pool } = require('../database/connection');
const {
  saveTeacherToDB,
  saveLectureToDB,
  saveCourseToDB,
  deleteLecturesFromDB,
  deleteCoursesFromDB,
  saveClassToDB,
  deleteClassesFromDB,
  truncateTables,
} = require('./dbMethods');

describe('GET /api/users/lectures/:teacherId', () => {
  let teacherId;
  let accessToken;

  beforeAll(async () => {
    teacherId = await saveTeacherToDB();
    const loginResponse = await supertest(server).post('/api/users/login').send({
      email: 'dimi1@gmail.com',
      password: '123$'
    });
    accessToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await deleteLecturesFromDB();
    await deleteCoursesFromDB();
    await deleteClassesFromDB();
  }, 20000);

  afterAll(async () => {
    await truncateTables();
    pool.end();
  });

  test('should get a single lecture for a teacher', async () => {
    const dateTime = formatDate(new Date());
    await saveCourseToDB(1, 'Development of Large Systems');
    await saveClassToDB(1, 'SD22w');
    await saveLectureToDB(teacherId, dateTime, 1, 1);
    await supertest(server).get(`/api/users/lectures/${teacherId}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .then((response) => {
        const localDate = new Date(response.body[0].start_date_time);
        expect(localDate.getDate()).toEqual(new Date(dateTime).getDate());
        expect(localDate.getMinutes()).toEqual(new Date(dateTime).getMinutes());
        expect(response.body[0].name).toEqual('Development of Large Systems');
      })
      .catch(async (error) => {
        throw new Error(error);
      });
  }, 20000);

  test('should get multiple lectures for a teacher', async () => {
    const now = new Date();
    const after45Minutes = new Date();
    after45Minutes.setMinutes(after45Minutes.getMinutes() + 45);
    const nowFormatted = formatDate(now);
    const after2hoursFormatted = formatDate(after45Minutes);
    await saveCourseToDB(1, 'Development of Large Systems');
    await saveCourseToDB(2, 'Testing');
    await saveClassToDB(1, 'SD22w');
    await saveClassToDB(2, 'SD23w');
    const lecture1 = await saveLectureToDB(teacherId, nowFormatted, 1, 1);
    const lecture2 = await saveLectureToDB(teacherId, after2hoursFormatted, 2, 2);
    await supertest(server).get(`/api/users/lectures/${teacherId}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body[0].lecture_id).toEqual(lecture1.lecture_id);
        const localDate1 = new Date(response.body[0].start_date_time); // we get time from server in UTC, new Date() converts it to local time
        expect(localDate1.getDate()).toEqual(new Date(nowFormatted).getDate());
        expect(localDate1.getMinutes()).toEqual(new Date(nowFormatted).getMinutes());
        expect(response.body[0].name).toEqual('Development of Large Systems');
        expect(response.body[1].lecture_id).toEqual(lecture2.lecture_id);
        const localDate2 = new Date(response.body[1].start_date_time);
        expect(localDate2.getDate()).toEqual(new Date(after2hoursFormatted).getDate());
        expect(localDate2.getMinutes()).toEqual(new Date(after2hoursFormatted).getMinutes());
        expect(response.body[1].name).toEqual('Testing');
      })
      .catch(async (error) => {
        throw new Error(error);
      });
  }, 20000);

  test('should get empty array if the date is other than today', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = formatDate(tomorrow);
    await saveCourseToDB(1, 'Development of Large Systems');
    await saveClassToDB(1, 'SD22w');
    await saveLectureToDB(teacherId, tomorrowFormatted, 1, 1);
    await supertest(server).get(`/api/users/lectures/${teacherId}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBeFalsy();
        expect(response.body.message).toEqual('Something went wrong');
      })
      .catch(async (error) => {
        throw new Error(error);
      });
  }, 20000);
});
