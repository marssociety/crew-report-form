-- Mars Society Crew Report Database Schema
-- This file contains the SQL table creation statements for storing crew reports

-- Main crew reports table
CREATE TABLE IF NOT EXISTS crew_reports (
    report_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    publish_date TIMESTAMP NOT NULL,
    author VARCHAR(100) NOT NULL,
    station VARCHAR(20) NOT NULL CHECK (station IN ('MDRS', 'FMARS', 'HI-SEAS', 'LUNARES')),
    mission_name VARCHAR(100) NOT NULL,
    crew_number VARCHAR(50) NOT NULL,
    mission_type VARCHAR(20) NOT NULL CHECK (mission_type IN ('Research', 'Training', 'Educational', 'Engineering')),
    mission_start_date TIMESTAMP NOT NULL,
    mission_duration_day INTEGER NOT NULL CHECK (mission_duration_day >= 1 AND mission_duration_day <= 365),
    report_date TIMESTAMP NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('Daily', 'Weekly', 'EVA', 'Incident', 'Final')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVA data table (optional, one-to-one with crew_reports)
CREATE TABLE IF NOT EXISTS eva_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) NOT NULL,
    eva_number INTEGER NOT NULL CHECK (eva_number >= 1),
    duration_minutes INTEGER CHECK (duration_minutes >= 1),
    safety_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- EVA participants table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS eva_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eva_data_id INTEGER NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eva_data_id) REFERENCES eva_data(id) ON DELETE CASCADE
);

-- EVA objectives table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS eva_objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eva_data_id INTEGER NOT NULL,
    objective TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eva_data_id) REFERENCES eva_data(id) ON DELETE CASCADE
);

-- Crew members table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS crew_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Commander', 'Executive Officer', 'Engineer', 'Scientist', 'Health & Safety Officer', 'Journalist')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Medical Leave', 'Departed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Resources table (optional, one-to-one with crew_reports)
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) NOT NULL,
    water_usage_liters DECIMAL(10,2) CHECK (water_usage_liters >= 0),
    power_usage_kwh DECIMAL(10,3) CHECK (power_usage_kwh >= 0),
    food_consumption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Environmental data table (optional, one-to-one with crew_reports)
CREATE TABLE IF NOT EXISTS environmental_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) NOT NULL,
    temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2) CHECK (humidity_percent >= 0 AND humidity_percent <= 100),
    pressure_kpa DECIMAL(8,2) CHECK (pressure_kpa >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Incidents table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(36) NOT NULL,
    incident_id VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Medical', 'Equipment Failure', 'Safety', 'Environmental')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT NOT NULL,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crew_reports_station ON crew_reports(station);
CREATE INDEX IF NOT EXISTS idx_crew_reports_mission_type ON crew_reports(mission_type);
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_type ON crew_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_crew_reports_publish_date ON crew_reports(publish_date);
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_date ON crew_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_crew_members_role ON crew_members(role);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);