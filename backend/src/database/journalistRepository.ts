import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface JournalistReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  journalistReportTitle: string;
  reportBody: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class JournalistRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: JournalistReport): Promise<string> {
    const reportId = report.id || uuidv4();

    await this.db.run(`
      INSERT INTO journalist_reports (
        id, crew_number, position, prepared_by, report_date, sol,
        journalist_report_title, report_body, email_subject, email_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      report.crewNumber,
      report.position,
      report.preparedBy,
      report.reportDate,
      report.sol,
      report.journalistReportTitle,
      report.reportBody,
      report.emailSubject || null,
      report.emailBody || null
    ]);

    return reportId;
  }

  async findById(id: string): Promise<JournalistReport | null> {
    const report = await this.db.get(`
      SELECT * FROM journalist_reports WHERE id = ?
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
      journalistReportTitle: report.journalist_report_title,
      reportBody: report.report_body,
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<JournalistReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM journalist_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: JournalistReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<JournalistReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM journalist_reports
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: JournalistReport[] = [];

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
      DELETE FROM journalist_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
