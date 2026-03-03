# Schema Relationship Map

Visual reference for table relationships and data flow. All foreign keys use `ON DELETE CASCADE`.

## Role-Specific Report Tables (Active)

```
sol_summary_reports          (standalone — no child tables)
├── PK: id (UUID)
├── indexed: crew_number, report_date
└── API: POST /api/reports/sol-summary

operations_reports
├── PK: id (UUID)
├── indexed: crew_number, report_date
├── API: POST /api/reports/operations
└──< operations_rover_readings
     └── FK: operations_report_id → operations_reports(id)
         (typically 4 rows: Spirit, Opportunity, Curiosity, Perseverance)

greenhab_reports
├── PK: id (UUID, correctly TEXT)
├── indexed: crew_number, report_date
├── API: POST /api/reports/greenhab
├──< greenhab_watering_times
│    └── FK: report_id → greenhab_reports(id)
└──< greenhab_harvests
     └── FK: report_id → greenhab_reports(id)

eva_reports                  (standalone)
├── PK: id (UUID)
├── indexed: crew_number, report_date
└── API: POST /api/reports/eva

eva_requests                 (standalone)
├── PK: id (UUID)
├── indexed: crew_number, report_date
└── API: POST /api/reports/eva-request

journalist_reports           (standalone)
├── PK: id (UUID)
├── indexed: crew_number, report_date
└── API: POST /api/reports/journalist

photos_of_the_day
├── PK: id (UUID)
├── indexed: crew_number, report_date
├── API: POST /api/reports/photos
└──< photo_attachments
     └── FK: photos_report_id → photos_of_the_day(id)

astronomy_reports            (standalone)
├── PK: id (UUID)
├── indexed: crew_number, report_date
└── API: POST /api/reports/astronomy

hso_checklists
├── PK: id (UUID)
├── indexed: crew_number
├── API: POST /api/reports/hso-checklist
└──< hso_equipment_checks
     └── FK: checklist_id → hso_checklists(id)

checkout_checklists
├── PK: id (UUID)
├── indexed: crew_number
├── API: POST /api/reports/checkout
└──< checkout_items
     └── FK: checklist_id → checkout_checklists(id)

food_inventories
├── PK: id (UUID)
├── indexed: crew_number
├── API: POST /api/reports/food-inventory
└──< food_inventory_items
     └── FK: inventory_id → food_inventories(id)
```

## Legacy Crew Report Tables

```
crew_reports
├── PK: report_id (TEXT)
├── indexed: report_date, station, crew_number, mission_type, report_type
├── API: POST /api/reports
│
├──< report_categories        FK: report_id  UNIQUE(report_id, category)
├──< report_tags               FK: report_id  UNIQUE(report_id, tag)
│
├──< crew_members              FK: report_id
│    └──< crew_equipment       FK: crew_member_id
│
├──< eva_planned_waypoints     FK: report_id
│    ├──< eva_planned_activities   FK: waypoint_id
│    └──< eva_planned_crew         FK: waypoint_id
│
├──< eva_actual_waypoints      FK: report_id
│    ├──< eva_activities_completed FK: waypoint_id
│    ├──< eva_observations         FK: waypoint_id
│    └──< eva_actual_crew          FK: waypoint_id
│
├──< resource_usage            FK: report_id  (1:1, UNIQUE)
├──< environmental_data        FK: report_id  (1:1, UNIQUE)
├──< incidents                 FK: report_id  (1:many)
├──< health_and_safety_summary FK: report_id  (1:1, UNIQUE)
├──< report_attachments        FK: report_id  (1:many)
└──< report_custom_metadata    FK: report_id  (1:1, UNIQUE)
```

## Tables Referenced in Code but Missing from Schema

```
eva_data                     (referenced in crewReportRepository.ts)
├── report_id → crew_reports(report_id)
├──< eva_participants        FK: eva_data_id
└──< eva_objectives          FK: eva_data_id

resources                    (referenced in crewReportRepository.ts)
└── report_id → crew_reports(report_id)
```

## Cross-Table Query Patterns

All reports can be queried by:
- **crew_number** — filter reports for a specific crew (e.g., Crew 301)
- **report_date** — filter by date, ordered DESC for most recent first
- **sol** — mission day number (not indexed, but filterable)

Common query pattern in all repositories:
```sql
SELECT * FROM <table> WHERE crew_number = ? ORDER BY report_date DESC, sol DESC
```

## Data Flow: Form → Database

```
Browser Form
    │
    ▼
POST /api/reports/<type>     (Express route)
    │
    ▼
<Type>Repository.save()      (generates UUID, runs INSERT)
    │
    ├── INSERT parent table   (single row)
    │
    └── INSERT child table(s) (loop over array items)
        └── FK = parent UUID
```

All writes use database transactions for tables with child records.
All reads reconstruct the full object by querying parent + child tables separately.
