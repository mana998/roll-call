const supertest = require('supertest');
const server = require('../app');

const { pool } = require('../database/connection');

beforeAll(async () => {
  await truncateTables();
});

describe('register test', () => {
  const userArrayPass = [
    {
      args: {
        firstName: 'Dagmara',
        lastName: 'Przygocka',
        userRole: 'TEACHER',
        email: 'v-kane@yahoo.com',
        password: 'JmE95osSMM4bYF',
        dateOfBirth: '1979-01-01',
        classId: null,
      },
      expected: 'User Dagmara Przygocka is registered & logged in!'
    },
    {
      args: {
        firstName: 'Marianna',
        lastName: 'Smith',
        userRole: 'STUDENT',
        email: 'v-m@yahoo.com',
        password: 'JmE95osSMM4bYK',
        dateOfBirth: '1969-01-01',
        classId: 1,
      },
      expected: 'User Marianna Smith is registered & logged in!'
    }
  ];
  const userArrayFail = [
    {
      args: {
        firstName: 'FailName',
        lastName: 'FailSurname',
        userRole: 'FAIL',
        email: 'ff@yahoo.com',
        password: 'KmE95osSMM4bYK',
        dateOfBirth: '1949-01-01',
        classId: 1,
      },
      expected: 'Please choose the role: TEACHER or STUDENT.'
    },
    {
      args: {
        firstName: 'FailName',
        lastName: 'FailSurname',
        userRole: 'STUDENT',
        email: 5,
        password: 'KmE95osSMM4bYK',
        dateOfBirth: '1999-01-01',
        classId: 1,
      },
      expected: 'Something went wrong. Try again.'
    },
    {
      args: {
        firstName: 'FailName',
        lastName: null,
        userRole: 'STUDENT',
        email: 'ff@yahoo.com',
        password: 'KmE95osSMM4bYK',
        dateOfBirth: '2000-02-01',
        classId: 1,
      },
      expected: 'Something went wrong. Try again.'
    },
    {
      args: {
        firstName: null,
        lastName: 'FailSurname',
        userRole: 'STUDENT',
        email: 'ff@yahoo.com',
        password: 'KmE95osSMM4bYK',
        dateOfBirth: '1999-01-01',
        classId: 1,
      },
      expected: 'Something went wrong. Try again.'
    },
    {
      args: {
        firstName: 'Marianna',
        lastName: 'Smith',
        userRole: 'STUDENT',
        email: ' v-m@yahoo.com',
        password: 'JmE95osSMM4bYKKKKKKKKKKKKKKKKKKKKKKKKKKKKJJJJJJJJJJJJJJJJJJJJJJJJJJJJOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
        dateOfBirth: '2000-01-01',
        classId: 1,
      },
      expected: 'Something went wrong. Try again.'
    }
  ];

  userArrayPass.forEach(({ args, expected }) => {
    test('POST /api/users/register', async () => {
      await addClass();
      await supertest(server).post('/api/users/register')
        .send({ ...args })
        .expect(202)
        .then((response) => {
          expect(response.body).toBeTruthy();
          expect(response.body.message).toEqual(expected);
        })
        .catch((e) => {
          throw e.stack;
        });
      await truncateTables();
    }, 20000);
  });

  userArrayFail.forEach(({ args, expected }) => {
    test('POST /api/users/register', async () => {
      await addClass();
      await supertest(server).post('/api/users/register')
        .send({ ...args })
        .then((response) => {
          expect(response.body).toBeTruthy();
          expect(response.body.message).toEqual(expected);
        })
        .catch((e) => {
          throw e.stack;
        });
      await truncateTables();
    }, 20000);
  });

  afterAll(async () => {
    await truncateTables();
    pool.end();
  });
});
const addClass = () => new Promise((resolve, reject) => {
  pool.getConnection((err, db) => {
    const query = 'INSERT INTO classes VALUES(1,"SD22w");';

    db.query(query, (error, result, fields) => {
      if (error) {
        reject(error);
      }
      resolve(result.insertId);
    });
    db.release();
  });
});

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
