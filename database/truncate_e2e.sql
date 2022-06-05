USE `rollcall_test`;

SET foreign_key_checks = 0;
TRUNCATE lectures;
TRUNCATE attendance;
TRUNCATE classes;
TRUNCATE courses;
TRUNCATE users;
SET foreign_key_checks = 1;

INSERT INTO classes (class_id, name) VALUES
(1, 'SD22w');

INSERT INTO users (user_id, first_name, last_name, email, user_role, password, class_id, date_of_birth) VALUES
(1, "Teacher1FirstName", "Teacher1LastName", "teacher1@gmail.com", "TEACHER", "$2b$15$uC0sNjstRkK/EBRnCLFkWujCEL.grKhk8NdLSFIccXwVeCR/o6lde", NULL, "1975-10-10"),
(2, "Student1FirstName", "Student1LastName", "student1@gmail.com", "STUDENT", "$2b$15$uC0sNjstRkK/EBRnCLFkWujCEL.grKhk8NdLSFIccXwVeCR/o6lde", NULL, "1985-10-10"),
(3, "Student2FirstName", "Student2LastName", "student2@gmail.com", "STUDENT", "$2b$15$uC0sNjstRkK/EBRnCLFkWujCEL.grKhk8NdLSFIccXwVeCR/o6lde", NULL, "1999-10-10"),
(4, "Student3FirstName", "Student3LastName", "student3@gmail.com", "STUDENT", "$2b$15$uC0sNjstRkK/EBRnCLFkWujCEL.grKhk8NdLSFIccXwVeCR/o6lde", NULL, "1995-10-10"),
(5, "Teacher2FirstName", "Teacher2LastName", "teacher2@gmail.com", "TEACHER", "$2b$15$uC0sNjstRkK/EBRnCLFkWujCEL.grKhk8NdLSFIccXwVeCR/o6lde", NULL, "1978-10-10");

INSERT INTO courses (course_id, name) VALUES
(1, 'Development of Large Systems');

INSERT INTO lectures (lecture_id, course_id, teacher_id, start_date_time, class_id) VALUES
(1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1),
(2, 1, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1),
(3, 1, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1),
(4, 1, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 1),
(5, 1, 1, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 1),
(6, 1, 1, DATE_SUB(CURDATE(), INTERVAL 32 DAY), 1);

INSERT INTO attendance (user_id, lecture_id, is_attending) VALUES
(2, 1, 1), (2, 2, 1), (2, 3, 1), (2, 4, 1), (2, 5, 1), (2, 6, 1), (3, 1, 1), (3, 2, 1), (3, 3, 1);
