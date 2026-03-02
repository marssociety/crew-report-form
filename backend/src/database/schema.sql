-- Mars Society Crew Report Database Schema
-- This schema matches the JSON crew report template structure exactly
-- Reference: https://github.com/marssociety/crew-report-template/blob/main/crew_report_template_strict.json

-- Main crew reports table - matches top-level JSON properties
CREATE TABLE IF NOT EXISTS crew_reports (
    report_id TEXT PRIMARY KEY,
    report_uuid TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    author TEXT NOT NULL,
    station TEXT NOT NULL,
    mission_name TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    mission_type TEXT NOT NULL,
    mission_start_date TEXT NOT NULL,
    mission_duration_day INTEGER NOT NULL,
    report_date TEXT NOT NULL,
    report_type TEXT NOT NULL,
    content TEXT,
    objectives TEXT,
    outcomes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories and tags (many-to-many)
CREATE TABLE IF NOT EXISTS report_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    category TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE,
    UNIQUE(report_id, category)
);

CREATE TABLE IF NOT EXISTS report_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE,
    UNIQUE(report_id, tag)
);

-- Crew members table - from crew_members array
CREATE TABLE IF NOT EXISTS crew_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    affiliation TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Equipment assigned to crew members (many-to-many)
CREATE TABLE IF NOT EXISTS crew_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_member_id INTEGER NOT NULL,
    equipment_id TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id) ON DELETE CASCADE
);

-- EVA planned waypoints
CREATE TABLE IF NOT EXISTS eva_planned_waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    waypoint_id TEXT NOT NULL,
    name TEXT NOT NULL,
    utm_zone TEXT,
    utm_easting INTEGER,
    utm_northing INTEGER,
    elevation_m REAL,
    estimated_duration_minutes INTEGER,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Planned waypoint activities
CREATE TABLE IF NOT EXISTS eva_planned_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    activity TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_planned_waypoints(id) ON DELETE CASCADE
);

-- Planned waypoint assigned crew
CREATE TABLE IF NOT EXISTS eva_planned_crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    crew_member_name TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_planned_waypoints(id) ON DELETE CASCADE
);

-- EVA actual waypoints
CREATE TABLE IF NOT EXISTS eva_actual_waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    waypoint_id TEXT NOT NULL,
    name TEXT NOT NULL,
    utm_zone TEXT,
    utm_easting INTEGER,
    utm_northing INTEGER,
    elevation_m REAL,
    duration_minutes INTEGER,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Actual waypoint activities completed
CREATE TABLE IF NOT EXISTS eva_activities_completed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    method TEXT,
    collection_type TEXT,
    desired_result TEXT,
    actual_result TEXT,
    notes TEXT,
    crew_member TEXT,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Actual waypoint observations
CREATE TABLE IF NOT EXISTS eva_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    observation_type TEXT NOT NULL,
    description TEXT NOT NULL,
    obs_utm_zone TEXT,
    obs_utm_easting INTEGER,
    obs_utm_northing INTEGER,
    observer TEXT,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Actual waypoint crew present
CREATE TABLE IF NOT EXISTS eva_actual_crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    crew_member_name TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Resource usage table - from resource_usage object
CREATE TABLE IF NOT EXISTS resource_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    water_consumed_liters REAL,
    power_used_kwh REAL,
    food_stocks_remaining_percent REAL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Environmental data table - from environmental_data object
CREATE TABLE IF NOT EXISTS environmental_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    temperature_c REAL,
    humidity_percent REAL,
    pressure_kpa REAL,
    wind_speed_kph REAL,
    notes TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Health and safety incidents - from health_and_safety.incidents array
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    resolution TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Health and safety summary - from health_and_safety object
CREATE TABLE IF NOT EXISTS health_and_safety_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    morale_level TEXT,
    medical_notes TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Metadata attachments - from metadata.attachments array
CREATE TABLE IF NOT EXISTS report_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    attachment_filename TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Custom metadata - from metadata.custom object (flexible JSON storage)
CREATE TABLE IF NOT EXISTS report_custom_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    custom_data TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- GreenHab reports table (separate from main crew reports)
CREATE TABLE IF NOT EXISTS greenhab_reports (
    id TEXT PRIMARY KEY,
    crew_number TEXT NOT NULL,
    position TEXT NOT NULL,
    report_prepared_by TEXT NOT NULL,
    report_date TEXT NOT NULL,
    sol INTEGER NOT NULL,
    environmental_control TEXT NOT NULL,
    avg_temperature TEXT NOT NULL,
    max_temperature TEXT NOT NULL,
    min_temperature TEXT NOT NULL,
    supplemental_light_hours REAL NOT NULL,
    daily_water_usage_crops TEXT NOT NULL,
    daily_water_usage_other TEXT,
    blue_tank_remaining REAL NOT NULL,
    crops_changes TEXT,
    narrative TEXT NOT NULL,
    support_needed TEXT,
    attached_pictures INTEGER DEFAULT 0,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GreenHab watering times
CREATE TABLE IF NOT EXISTS greenhab_watering_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    watering_time TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES greenhab_reports(id) ON DELETE CASCADE
);

-- GreenHab harvest data
CREATE TABLE IF NOT EXISTS greenhab_harvests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    mass_grams REAL NOT NULL,
    FOREIGN KEY (report_id) REFERENCES greenhab_reports(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_date ON crew_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_crew_reports_station ON crew_reports(station);
CREATE INDEX IF NOT EXISTS idx_crew_reports_crew_number ON crew_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_crew_reports_mission_type ON crew_reports(mission_type);
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_type ON crew_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_crew_members_report_id ON crew_members(report_id);
CREATE INDEX IF NOT EXISTS idx_crew_equipment_crew_member_id ON crew_equipment(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_eva_planned_waypoints_report_id ON eva_planned_waypoints(report_id);
CREATE INDEX IF NOT EXISTS idx_eva_actual_waypoints_report_id ON eva_actual_waypoints(report_id);
CREATE INDEX IF NOT EXISTS idx_incidents_report_id ON incidents(report_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_report_id ON resource_usage(report_id);
CREATE INDEX IF NOT EXISTS idx_environmental_data_report_id ON environmental_data(report_id);
CREATE INDEX IF NOT EXISTS idx_report_categories_report_id ON report_categories(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tags_report_id ON report_tags(report_id);
CREATE INDEX IF NOT EXISTS idx_greenhab_reports_date ON greenhab_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_greenhab_reports_crew_number ON greenhab_reports(crew_number);

-- ============================================================
-- MDRS Role-Specific Report Tables (2025-2026 Templates)
-- ============================================================

-- Sol Summary Reports
CREATE TABLE IF NOT EXISTS sol_summary_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    summary_title TEXT,
    mission_status TEXT,
    sol_activity_summary TEXT,
    look_ahead_plan TEXT,
    anomalies TEXT,
    weather TEXT,
    crew_physical_status TEXT,
    eva TEXT,
    reports_to_be_filed TEXT,
    support_requested TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Operations Reports
CREATE TABLE IF NOT EXISTS operations_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    non_nominal_systems TEXT,
    notes_on_non_nominal TEXT,
    general_notes_on_rovers TEXT,
    summary_of_hab_operations TEXT,
    water_use TEXT,
    main_tank_level TEXT,
    main_water_tank_pipe_heater TEXT,
    main_water_tank_heater TEXT,
    toilet_tank_emptied TEXT,
    summary_of_internet TEXT,
    summary_of_suits_and_radios TEXT,
    summary_of_greenhab TEXT,
    greenhab_water_use_gallons REAL,
    greenhab_heater TEXT,
    greenhab_supplemental_light TEXT,
    greenhab_harvest TEXT,
    summary_of_sciencedome TEXT,
    dual_split TEXT,
    summary_of_ram TEXT,
    summary_of_observatory TEXT,
    summary_of_health_safety TEXT,
    questions_to_mission_support TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Operations Report Rover Readings (child table, 4 rows per report)
CREATE TABLE IF NOT EXISTS operations_rover_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operations_report_id INTEGER NOT NULL
        REFERENCES operations_reports(id) ON DELETE CASCADE,
    rover_name TEXT NOT NULL,
    rover_used TEXT,
    hours REAL,
    beginning_charge REAL,
    ending_charge REAL,
    currently_charging TEXT
);

-- EVA Reports
CREATE TABLE IF NOT EXISTS eva_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    eva_number INTEGER,
    purpose TEXT,
    start_time TEXT,
    end_time TEXT,
    narrative TEXT,
    destination TEXT,
    coord_easting TEXT,
    coord_northing TEXT,
    participants TEXT,
    routes TEXT,
    mode_of_travel TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- EVA Requests
CREATE TABLE IF NOT EXISTS eva_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    eva_number INTEGER,
    request_date TEXT,
    requested_eva_date TEXT,
    requested_start_time TEXT,
    requested_end_time TEXT,
    weather_supports_eva TEXT,
    purpose TEXT,
    destination TEXT,
    coordinates TEXT,
    participants TEXT,
    routes TEXT,
    mode_of_travel TEXT,
    vehicles TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Journalist Reports
CREATE TABLE IF NOT EXISTS journalist_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    journalist_report_title TEXT,
    report_body TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photos of the Day
CREATE TABLE IF NOT EXISTS photos_of_the_day (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photo_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photos_report_id INTEGER NOT NULL
        REFERENCES photos_of_the_day(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT,
    caption TEXT,
    file_path TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Astronomy Reports
CREATE TABLE IF NOT EXISTS astronomy_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    robotic_telescope_requested TEXT,
    objects_to_be_imaged TEXT,
    robotic_images_submitted TEXT,
    robotic_problems_encountered TEXT,
    solar_features_observed TEXT,
    musk_images_submitted TEXT,
    musk_problems_encountered TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HSO Beginning of Mission Checklists
CREATE TABLE IF NOT EXISTS hso_checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    stairs_functional TEXT,
    emergency_window_functional TEXT,
    commanders_window_functional TEXT,
    first_aid_inventory TEXT,
    safety_issues TEXT,
    health_environmental_issues TEXT,
    missing_recommended_supplies TEXT,
    equipment_notes TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hso_equipment_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checklist_id INTEGER NOT NULL
        REFERENCES hso_checklists(id) ON DELETE CASCADE,
    equipment_type TEXT NOT NULL,
    location TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Checkout Checklists
CREATE TABLE IF NOT EXISTS checkout_checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    damages TEXT,
    repair_estimate TEXT,
    cleaning_fee_estimate TEXT,
    cleaning_fee_actual TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkout_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checklist_id INTEGER NOT NULL
        REFERENCES checkout_checklists(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    item_description TEXT NOT NULL,
    crew_confirmed BOOLEAN DEFAULT FALSE,
    staff_confirmed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Food Inventories
CREATE TABLE IF NOT EXISTS food_inventories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    position TEXT,
    prepared_by TEXT,
    report_date TEXT,
    sol INTEGER,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER NOT NULL
        REFERENCES food_inventories(id) ON DELETE CASCADE,
    food_type TEXT,
    item_name TEXT,
    starting_amount REAL,
    unit TEXT,
    weight_lbs TEXT,
    remaining_fraction TEXT
);

-- Indexes for role-specific report tables
CREATE INDEX IF NOT EXISTS idx_sol_summary_crew ON sol_summary_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_sol_summary_date ON sol_summary_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_operations_crew ON operations_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_operations_date ON operations_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_eva_reports_crew ON eva_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_eva_reports_date ON eva_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_eva_requests_crew ON eva_requests(crew_number);
CREATE INDEX IF NOT EXISTS idx_eva_requests_date ON eva_requests(report_date);
CREATE INDEX IF NOT EXISTS idx_journalist_crew ON journalist_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_journalist_date ON journalist_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_photos_crew ON photos_of_the_day(crew_number);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos_of_the_day(report_date);
CREATE INDEX IF NOT EXISTS idx_astronomy_crew ON astronomy_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_astronomy_date ON astronomy_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_hso_crew ON hso_checklists(crew_number);
CREATE INDEX IF NOT EXISTS idx_checkout_crew ON checkout_checklists(crew_number);
CREATE INDEX IF NOT EXISTS idx_food_inv_crew ON food_inventories(crew_number);