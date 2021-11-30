DROP TABLE IF EXISTS
weeks,
week_dates,
group_names,
days,
week_day_ids,
day_names,
day_dates,
subjects,
day_subject_ids,
location_names,
lecturer_names,
subject_names,
class_times
CASCADE;


CREATE TABLE IF NOT EXISTS class_times
(
	class_time_id SERIAL PRIMARY KEY,
	class_time_code integer NOT NULL UNIQUE,
	class_time varchar(16) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS subject_names
(
	subject_name_id SERIAL PRIMARY KEY,
	subject_name varchar (128) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS lecturer_names
(
	lecturer_name_id SERIAL PRIMARY KEY,
	lecturer_name varchar (64) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS location_names
(
	location_name_id SERIAL PRIMARY KEY,
	location_name varchar (128) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS day_subject_ids
(
	day_subject_id SERIAL PRIMARY KEY
);


CREATE TABLE IF NOT EXISTS subjects
(
	subject_id SERIAL PRIMARY KEY,
	
	class_time_id integer NOT NULL,
	subject_name_id integer NOT NULL,
	lecturer_name_id integer NOT NULL,
	location_name_id integer NOT NULL,
	
	day_subject_id integer NOT NULL,
	
	FOREIGN KEY (class_time_id) REFERENCES class_times(class_time_id) ON DELETE RESTRICT,
	FOREIGN KEY (subject_name_id) REFERENCES subject_names(subject_name_id) ON DELETE RESTRICT,
	FOREIGN KEY (lecturer_name_id) REFERENCES lecturer_names(lecturer_name_id) ON DELETE RESTRICT,
	FOREIGN KEY (location_name_id) REFERENCES location_names(location_name_id) ON DELETE RESTRICT,
	
	FOREIGN KEY (day_subject_id) REFERENCES day_subject_ids(day_subject_id) ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS day_names
(
	day_name_id SERIAL PRIMARY KEY,
	day_name varchar(16) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS day_dates
(
	day_date_id SERIAL PRIMARY KEY,
	day_date varchar(32) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS week_day_ids
(
	week_day_id SERIAL PRIMARY KEY
);


CREATE TABLE IF NOT EXISTS days
(
	day_id SERIAL PRIMARY KEY,
	day_name_id integer NOT NULL,
	day_date_id integer NOT NULL,
	
	day_subject_id integer NOT NULL,
	week_day_id integer NOT NULL,
	
	FOREIGN KEY (day_name_id) REFERENCES day_names(day_name_id) ON DELETE RESTRICT,
	
	FOREIGN KEY (day_subject_id) REFERENCES day_subject_ids(day_subject_id) ON DELETE RESTRICT,
	FOREIGN KEY (week_day_id) REFERENCES week_day_ids(week_day_id) ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS group_names
(
	group_name_id SERIAL PRIMARY KEY,
	group_name varchar(16) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS week_dates
(
	week_date_id SERIAL PRIMARY KEY,
	week_date varchar(32) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS weeks
(
	week_date_id integer NOT NULL,
	group_name_id integer NOT NULL,
	
	week_day_id integer NOT NULL,
	
	FOREIGN KEY (week_date_id) REFERENCES week_dates(week_date_id) ON DELETE RESTRICT,
	FOREIGN KEY (group_name_id) REFERENCES group_names(group_name_id) ON DELETE RESTRICT,
	
	PRIMARY KEY (week_date_id, group_name_id),
	
	FOREIGN KEY (week_day_id) REFERENCES week_day_ids(week_day_id) ON DELETE RESTRICT
);


INSERT INTO day_names(day_name) VALUES
('понедельник'),
('вторник'),
('среда'),
('четверг'),
('пятница'),
('суббота'), 
('воскресенье');
