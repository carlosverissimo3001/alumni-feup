-- This is an empty migration.

-- Faculty - FEUP
INSERT INTO faculty (id, name, name_int, acronym) 
VALUES ('ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'Faculdade de Engenharia da Universidade do Porto', 'Faculty of Engineering of the University of Porto', 'FEUP');

-- ***** Courses *****
-- MIEIC
INSERT INTO course (id, name, name_int, status, start_year, end_year, acronym, faculty_id, course_type)
VALUES (gen_random_uuid(), 'Mestrado Integrado em Engenharia Informática e Computação', 'Master in Informatics and Computing Engineering', 'INACTIVE', 2006, 2021, 'MIEIC', 'ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'INTEGRATED');
-- MEI
INSERT INTO course (id, name, name_int, status, start_year, end_year, acronym, faculty_id, course_type)
VALUES (gen_random_uuid(), 'Mestrado em Engenharia Informática', 'Master in Informatics Engineering', 'INACTIVE', 2003, 2009, 'MEI', 'ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'MASTERS');
-- M.EIC
INSERT INTO course (id, name, name_int, status, start_year, acronym, faculty_id, course_type)
VALUES (gen_random_uuid(), 'Mestrado em Engenharia Informática e Computação', 'Master in Informatics and Computing Engineering', 'ACTIVE', 2021, 'M.EIC', 'ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'MASTERS');
-- LEIC
INSERT INTO course (id, name, name_int, status, start_year, end_year, acronym, faculty_id, course_type)
VALUES (gen_random_uuid(), 'Licenciatura em Engenharia Informática e Computação', 'Bachelor in Informatics and Computing Engineering', 'INACTIVE', 1994, 2008, 'LEIC', 'ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'BACHELORS');
-- L_EIC (This is L.EIC, but we use the _ because the dot is not allowed in the database)
INSERT INTO course (id, name, name_int, status, start_year, acronym, faculty_id, course_type)
VALUES (gen_random_uuid(), 'Licenciatura em Engenharia Informática e Computação (Bologna)', 'Bachelor in Informatics and Computing Engineering (Bologna)', 'ACTIVE', 2021, 'L_EIC', 'ee79b9d1-1323-42b7-9b87-eda4935c3a88', 'BACHELORS');

