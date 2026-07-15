/* LATEST SCRIPT */

/* INTERN */
CREATE TABLE intern (
	intern_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	intern_name VARCHAR(255) NOT NULL,
	school_name VARCHAR(255),
	abbreviation VARCHAR(255),
	shift_name VARCHAR(255) NOT NULL,
	time_in TIME,
	time_out TIME,
	total_hours INTERVAL,
	time_remain INTERVAL,	
	status VARCHAR(255) CHECK(status IN ('Active', 'Completed', 'Terminated')),
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

SELECT * FROM intern;	

DELETE FROM intern;	

DROP TABLE intern;

/* ATTENDANCE */
CREATE TABLE attendance (
	attendance_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	intern_id UUID REFERENCES intern(intern_id) ON DELETE CASCADE,
	attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	abbreviation VARCHAR(255),
	intern_name VARCHAR(255),
	time_in TIMESTAMP,
	time_out TIMESTAMP,
	total_hours INTERVAL, /*within the day*/	
	check_in VARCHAR(255) CHECK(check_in IN ('Regular Hours', 'Late', 'Absent', 'Holiday', 'Early In', 'Early Out', 'Off Set', 'Overtime')),
	remarks VARCHAR(255),	
	updated_at TIMESTAMP DEFAULT current_timestamp
);	

DELETE FROM attendance;

SELECT * FROM attendance;	

DROP TABLE attendance;	

/* Intern_History Table*/
CREATE TABLE intern_history (
    intern_id UUID PRIMARY KEY,
    intern_name VARCHAR(255),
    school_name VARCHAR(255),
    abbreviation VARCHAR(255),
    shift_name VARCHAR(255),
    total_hours INTERVAL,
    status VARCHAR(255)
);

SELECT * FROM intern_history;

DELETE FROM intern_history;

DROP TABLE intern_history;
