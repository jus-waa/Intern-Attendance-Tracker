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
    intern_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    coordinator_name VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    required_hours INT,
    total_required_hours INT,
    status VARCHAR(50)
);


-- Sample Data for Intern Table
--Completed Interns
INSERT INTO intern (
    intern_name, school_name, shift_name,
    start_date, end_date, time_in, time_out,
    total_hours, time_remain, status
) VALUES 
('Ana Cruz', 'Don Bosco Technical College', 'Morning Shift',
 '2025-06-01', '2025-08-01', '08:00', '16:00',
 INTERVAL '320 hours', 0, 'Completed'),
 
('Ben Santos', 'Don Bosco Technical College', 'Morning Shift',
 '2025-06-01', '2025-08-01', '08:00', '16:00',
 INTERVAL '320 hours', 0, 'Completed');

--Terminated Intern
INSERT INTO intern (
    intern_name, school_name, shift_name,
    start_date, end_date, time_in, time_out,
    total_hours, time_remain, status
) VALUES 
('Cathy Lopez', 'Don Bosco Technical College', 'Morning Shift',
 '2025-06-01', '2025-08-01', '08:00', '16:00',
 INTERVAL '320 hours', 100, 'Terminated');

-- Active Intern (to be checked out)
INSERT INTO intern (
    intern_name, school_name, shift_name,
    start_date, end_date, time_in, time_out,
    total_hours, time_remain, status
) VALUES 
('David Lim', 'Don Bosco Technical College', 'Morning Shift',
 '2025-06-01', '2025-08-01', '08:00', '16:00',
 INTERVAL '320 hours', 8, 'Active');
