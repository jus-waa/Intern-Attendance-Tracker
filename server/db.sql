--intern-
CREATE TABLE school(
	school_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	school_name VARCHAR(255)
);

CREATE TABLE shift(
	shift_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	shift_name VARCHAR(255) NOT NULL
);

CREATE TABLE intern (
	intern_id INT GENERATED ALWAYS AS IDENTITY NOT NULL PRIMARY KEY,
	intern_name VARCHAR(255) NOT NULL,
	school_id INT,
	shift_id INT NOT NULL,		
	time_in TIME,
	time_out TIME, 
	time_remain INTERVAL,
	status VARCHAR(255) CHECK(status IN ('Active', 'Completed', 'Terminated')),
	qr_code TEXT,
	created_at TIMESTAMP DEFAULT current_timestamp,
	updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE OR REPLACE FUNCTION updated_at()
	returns TRIGGER AS $$
BEGIN 
	NEW.updated_at = current_timestamp;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql

CREATE TRIGGER trigger_updated_at
	BEFORE UPDATE
	ON intern
	FOR EACH ROW
	EXECUTE PROCEDURE updated_at()
--intern input--
INSERT INTO school (school_name) VALUES ('Cavite State University - Main Campus');

INSERT INTO shift (shift_name) VALUES ('Morning Shift');
INSERT INTO shift (shift_name) VALUES ('Night Shift');

ALTER TABLE intern 
ALTER COLUMN shift_id DROP NOT NULL;

INSERT INTO intern (intern_name, time_in, time_out, time_remain, status, qr_code)
VALUES ('Josh Lagrimas', '06:00:00', '17:00:00', '240 hours', 'Active', 'SampleQRCpde') RETURNING *;

SELECT * FROM intern;
/* LATEST SCRIPT */
/* INTERN */
CREATE TABLE intern (
	intern_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	intern_name VARCHAR(255) NOT NULL,
	school_name VARCHAR(255),
	shift_name VARCHAR(255) NOT NULL,
	time_in TIME,
	time_out TIME,
	total_hours INTERVAL,
	time_remain INTERVAL,	
	status VARCHAR(255) CHECK(status IN ('Active', 'Completed', 'Terminated')),
	qr_code TEXT,
	created_at TIMESTAMP DEFAULT current_timestamp,
	updated_at TIMESTAMP DEFAULT current_timestamp
);	

SELECT gen_random_uuid();

CREATE OR REPLACE FUNCTION updated_at()
	returns TRIGGER AS $$
BEGIN 
	NEW.updated_at = current_timestamp;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql

CREATE TRIGGER trigger_updated_at
	BEFORE UPDATE
	ON intern
	FOR EACH ROW
	EXECUTE PROCEDURE updated_at()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE intern;

SELECT * FROM intern;

DELETE FROM intern;
/* ATTENDANCE */
CREATE TABLE attendance (
	attendance_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	intern_id UUID REFERENCES intern(intern_id) ON DELETE CASCADE,
	attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	time_in TIME,
	time_out TIME,
	total_hours INTERVAL, /*within the day*/	
	check_in VARCHAR(255) CHECK(check_in IN ('Regular Hours', 'Late', 'Absent', 'Holiday', 'Early In', 'Early Out', 'Off Set', 'Overtime')),
	remarks VARCHAR(255)
);	