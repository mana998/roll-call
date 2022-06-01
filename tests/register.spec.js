const server = require("../app");
const supertest = require("supertest");

const {pool} = require('../database/connection');
describe('register test', () => {

    const userArrayPass = [
        {args: {
            firstName: "Dagmara",
            lastName: "Przygocka",
            userRole: "TEACHER",
            email: "v-kane@yahoo.com",
            password: "JmE95osSMM4bYF", 
            dateOfBirth: "1979-01-01",
            classId: null,
        }, expected: "Something went wrong. Try again."},
        {args: {
            firstName: "Marianna",
            lastName: "Smith",
            userRole: "STUDENT",
            email: " v-m@yahoo.com",
            password: "JmE95osSMM4bYK", 
            dateOfBirth: "1969-01-01",
            classId: 1,
        }, expected: "Something went wrong. Try again."}
    ];
    const userArrayFail = [
        {args: {
            firstName: "FailName",
            lastName: "FailSurname",
            userRole: "FAIL",
            email: "ff@yahoo.com",
            password: "KmE95osSMM4bYK", 
            dateOfBirth: "1949-01-01",
            classId: 1,
        }, expected: "Please choose the role: TEACHER or STUDENT."},
        {args: {
            firstName: "FailName",
            lastName: "FailSurname",
            userRole: "STUDENT",
            email: 5,
            password: "KmE95osSMM4bYK", 
            dateOfBirth: "1999-01-01",
            classId: 1,
        }, expected: "Something went wrong. Try again."},
        {args: {
            firstName: "FailName",
            lastName: null,
            userRole: "STUDENT",
            email: "ff@yahoo.com",
            password: "KmE95osSMM4bYK", 
            dateOfBirth: "2000-02-01",
            classId: 1,
        }, expected: "Something went wrong. Try again."},
        {args: {
            firstName: null,
            lastName: "FailSurname",
            userRole: "STUDENT",
            email: "ff@yahoo.com",
            password: "KmE95osSMM4bYK", 
            dateOfBirth: "1999-01-01",
            classId: 1,
        }, expected: "Something went wrong. Try again."},
        {args: {
            firstName: "Marianna",
            lastName: "Smith",
            userRole: "STUDENT",
            email: " v-m@yahoo.com",
            password: "JmE95osSMM4bYKKKKKKKKKKKKKKKKKKKKKKKKKKKKJJJJJJJJJJJJJJJJJJJJJJJJJJJJOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII", 
            dateOfBirth: "2000-01-01",
            classId: 1,
        }, expected: "Something went wrong. Try again."}
    ];

    userArrayPass.forEach(({ args, expected }) => {
        test("POST /api/users/register", async () => {
            await supertest(server).post(`/api/users/register`)
                .send({args})
                .expect(200)
                .then((response) => {
                    expect(response.body).toBeTruthy();
                    expect(response.body.message).toEqual(expected);
                }).catch( (e) => {
                    throw e.stack;
                });
                await deleteUserFromDB();
        }, 20000);
    });

    userArrayFail.forEach(({ args, expected }) => {
        test("POST /api/users/register", async () => {
            await supertest(server).post(`/api/users/register`)
                .send({args})
                .expect(200)
                .then((response) => {
                    expect(response.body).toBeTruthy();
                    expect(response.body.message).toEqual(expected);
                }).catch( (e) => {
                    throw e.stack;
                });
                await deleteUserFromDB();
        }, 20000);
    });

    afterAll(()=> {
        pool.end();
    });

});

function deleteUserFromDB () {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, db) => {
            let query =
                'DELETE FROM users where user_id >0;';
            db.query(query, (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve("Data deleted");
            });
            db.release();
        });
    })
}