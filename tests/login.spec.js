const supertest = require('supertest');
const server = require('../app');
const { pool } = require('../database/connection');

describe('login test', () => {
  const loginPass = [
    {
      args: {
        email: 'v-kane@yahoo.com',
        password: 'JmE95osSMM4bYF'
      }
    }
  ];

  const loginFail = [
    {
      args: {
        email: 'fake-kane@yahoo.com',
        password: 'JmE95osSMM4bYF'
      },
      expected: 'Invalid password or email'
    },
    {
      args: {
        email: 'v-kane@yahoo.com',
        password: 'JmE95osSMM4bYG'
      },
      expected: 'Invalid password or email'
    },
  ];

  loginPass.forEach(({ args }) => {
    test('POST /api/users/login', async () => {
      await truncateTables();
      await insertInitialData();
      await supertest(server).post('/api/users/login')
        .send({ ...args })
        .expect(202)
        .then((response) => {
          expect(response.body).toBeTruthy();
          expect(typeof response.body.claims.id).toBe('number');
          expect(response.body.claims.role).toEqual('TEACHER');
          expect(response.body.claims.email).toEqual('v-kane@yahoo.com');
          expect(response.body.claims.firstName).toEqual('Kane');
          expect(response.body.claims.lastName).toEqual('Vasquez');
        })
        .catch((e) => {
          throw e.stack;
        });
      await truncateTables();
    }, 20000);
  });

  loginFail.forEach(({ args, expected }) => {
    test('POST /api/users/login', async () => {
      await truncateTables();
      await insertInitialData();
      await supertest(server).post('/api/users/login')
        .send({ ...args })
        .expect(401)
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

function insertInitialData() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, db) => {
      const query = 'INSERT INTO users (user_id, first_name, last_name, email, user_role, password, date_of_birth, class_id) VALUES (1, "Kane", "Vasquez", "v-kane@yahoo.com", "TEACHER", "$2b$15$PGfdEXxNY2M.OSsh1mjIFuy9Tg32Z3Cc5QkKPGIW5f.DNVXpGYwOa", "2000-01-01", NULL);';
      db.query(query, (error, result, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      db.release();
    });
  });
}
