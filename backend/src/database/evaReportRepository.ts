import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface EvaReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  evaNumber: string;
  purpose: string;
  startTime: string;
  endTime: string;
  narrative: string;
  destination: string;
  coordEasting: string;
  coordNorthing: string;
  participants: string;
  routes: string;
  modeOfTravel: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class EvaReportRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: EvaReport): Promise<string> {
    const reportId = report.id || uuidv4();

    await this.db.run(`
      INSERT INTO eva_reports (
        id, crew_number, position, prepared_by, report_date, sol,
        eva_number, purpose, start_time, end_time, narrative, destination,
        coord_easting, coord_northing, participants, routes, mode_of_travel,
        email_subject, email_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      report.crewNumber,
      report.position,
      report.preparedBy,
      report.reportDate,
      report.sol,
      report.evaNumber,
      report.purpose,
      report.startTime,
      report.endTime,
      report.narrative,
      report.destination,
      report.coordEasting,
      report.coordNorthing,
      report.participants,
      report.routes,
      report.modeOfTravel,
      report.emailSubject || null,
      report.emailBody || null
    ]);

    return reportId;
  }

  async findById(id: string): Promise<EvaReport | null> {
    const report = await this.db.get(`
      SELECT * FROM eva_reports WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      evaNumber: report.eva_number,
      purpose: report.purpose,
      startTime: report.start_time,
      endTime: report.end_time,
      narrative: report.narrative,
      destination: report.destination,
      coordEasting: report.coord_easting,
      coordNorthing: report.coord_northing,
      participants: report.participants,
      routes: report.routes,
      modeOfTravel: report.mode_of_travel,
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<EvaReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM eva_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: EvaReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<EvaReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM eva_reports
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: EvaReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run(`
      DELETE FROM eva_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
