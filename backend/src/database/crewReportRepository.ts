import Database from './database';

export interface CrewReportData {
  report_id: string;
  title: string;
  publish_date: string;
  author: string;
  station: string;
  mission_name: string;
  crew_number: string;
  mission_type: string;
  mission_start_date: string;
  mission_duration_day: number;
  report_date: string;
  report_type: string;
  content: string;
  eva_data?: {
    eva_number: number;
    participants: string[];
    duration_minutes?: number;
    objectives?: string[];
    safety_notes?: string;
  };
  crew_members?: Array<{
    name: string;
    role: string;
    status: string;
  }>;
  resources?: {
    water_usage_liters?: number;
    power_usage_kwh?: number;
    food_consumption?: string;
  };
  environmental_data?: {
    temperature_celsius?: number;
    humidity_percent?: number;
    pressure_kpa?: number;
  };
  incidents?: Array<{
    incident_id: string;
    type: string;
    severity: string;
    description: string;
    resolution?: string;
  }>;
}

export class CrewReportRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  public async saveCrewReport(reportData: CrewReportData): Promise<void> {
    await this.db.transaction(async () => {
      // Insert main crew report
      await this.db.run(`
        INSERT INTO crew_reports (
          report_id, title, publish_date, author, station, mission_name,
          crew_number, mission_type, mission_start_date, mission_duration_day,
          report_date, report_type, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportData.report_id,
        reportData.title,
        reportData.publish_date,
        reportData.author,
        reportData.station,
        reportData.mission_name,
        reportData.crew_number,
        reportData.mission_type,
        reportData.mission_start_date,
        reportData.mission_duration_day,
        reportData.report_date,
        reportData.report_type,
        reportData.content
      ]);

      // Insert EVA data if present
      if (reportData.eva_data) {
        const evaResult = await this.db.run(`
          INSERT INTO eva_data (report_id, eva_number, duration_minutes, safety_notes)
          VALUES (?, ?, ?, ?)
        `, [
          reportData.report_id,
          reportData.eva_data.eva_number,
          reportData.eva_data.duration_minutes || null,
          reportData.eva_data.safety_notes || null
        ]);

        const evaDataId = evaResult.lastID;

        // Insert EVA participants
        if (reportData.eva_data.participants) {
          for (const participant of reportData.eva_data.participants) {
            await this.db.run(`
              INSERT INTO eva_participants (eva_data_id, participant_name)
              VALUES (?, ?)
            `, [evaDataId, participant]);
          }
        }

        // Insert EVA objectives
        if (reportData.eva_data.objectives) {
          for (const objective of reportData.eva_data.objectives) {
            await this.db.run(`
              INSERT INTO eva_objectives (eva_data_id, objective)
              VALUES (?, ?)
            `, [evaDataId, objective]);
          }
        }
      }

      // Insert crew members if present
      if (reportData.crew_members) {
        for (const member of reportData.crew_members) {
          await this.db.run(`
            INSERT INTO crew_members (report_id, name, role, status)
            VALUES (?, ?, ?, ?)
          `, [reportData.report_id, member.name, member.role, member.status]);
        }
      }

      // Insert resources if present
      if (reportData.resources) {
        await this.db.run(`
          INSERT INTO resources (report_id, water_usage_liters, power_usage_kwh, food_consumption)
          VALUES (?, ?, ?, ?)
        `, [
          reportData.report_id,
          reportData.resources.water_usage_liters || null,
          reportData.resources.power_usage_kwh || null,
          reportData.resources.food_consumption || null
        ]);
      }

      // Insert environmental data if present
      if (reportData.environmental_data) {
        await this.db.run(`
          INSERT INTO environmental_data (report_id, temperature_celsius, humidity_percent, pressure_kpa)
          VALUES (?, ?, ?, ?)
        `, [
          reportData.report_id,
          reportData.environmental_data.temperature_celsius || null,
          reportData.environmental_data.humidity_percent || null,
          reportData.environmental_data.pressure_kpa || null
        ]);
      }

      // Insert incidents if present
      if (reportData.incidents) {
        for (const incident of reportData.incidents) {
          await this.db.run(`
            INSERT INTO incidents (report_id, incident_id, type, severity, description, resolution)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            reportData.report_id,
            incident.incident_id,
            incident.type,
            incident.severity,
            incident.description,
            incident.resolution || null
          ]);
        }
      }
    });
  }

  public async getCrewReport(reportId: string): Promise<CrewReportData | null> {
    // Get main report data
    const report = await this.db.get(`
      SELECT * FROM crew_reports WHERE report_id = ?
    `, [reportId]);

    if (!report) {
      return null;
    }

    const reportData: CrewReportData = {
      report_id: report.report_id,
      title: report.title,
      publish_date: report.publish_date,
      author: report.author,
      station: report.station,
      mission_name: report.mission_name,
      crew_number: report.crew_number,
      mission_type: report.mission_type,
      mission_start_date: report.mission_start_date,
      mission_duration_day: report.mission_duration_day,
      report_date: report.report_date,
      report_type: report.report_type,
      content: report.content
    };

    // Get EVA data
    const evaData = await this.db.get(`
      SELECT * FROM eva_data WHERE report_id = ?
    `, [reportId]);

    if (evaData) {
      const participants = await this.db.all(`
        SELECT participant_name FROM eva_participants WHERE eva_data_id = ?
      `, [evaData.id]);

      const objectives = await this.db.all(`
        SELECT objective FROM eva_objectives WHERE eva_data_id = ?
      `, [evaData.id]);

      reportData.eva_data = {
        eva_number: evaData.eva_number,
        participants: participants.map(p => p.participant_name),
        duration_minutes: evaData.duration_minutes,
        objectives: objectives.map(o => o.objective),
        safety_notes: evaData.safety_notes
      };
    }

    // Get crew members
    const crewMembers = await this.db.all(`
      SELECT name, role, status FROM crew_members WHERE report_id = ?
    `, [reportId]);

    if (crewMembers.length > 0) {
      reportData.crew_members = crewMembers;
    }

    // Get resources
    const resources = await this.db.get(`
      SELECT water_usage_liters, power_usage_kwh, food_consumption FROM resources WHERE report_id = ?
    `, [reportId]);

    if (resources) {
      reportData.resources = resources;
    }

    // Get environmental data
    const environmentalData = await this.db.get(`
      SELECT temperature_celsius, humidity_percent, pressure_kpa FROM environmental_data WHERE report_id = ?
    `, [reportId]);

    if (environmentalData) {
      reportData.environmental_data = environmentalData;
    }

    // Get incidents
    const incidents = await this.db.all(`
      SELECT incident_id, type, severity, description, resolution FROM incidents WHERE report_id = ?
    `, [reportId]);

    if (incidents.length > 0) {
      reportData.incidents = incidents;
    }

    return reportData;
  }

  public async getAllCrewReports(): Promise<CrewReportData[]> {
    const reports = await this.db.all(`
      SELECT report_id FROM crew_reports ORDER BY publish_date DESC
    `);

    const fullReports: CrewReportData[] = [];
    for (const report of reports) {
      const fullReport = await this.getCrewReport(report.report_id);
      if (fullReport) {
        fullReports.push(fullReport);
      }
    }

    return fullReports;
  }
}

export default CrewReportRepository;