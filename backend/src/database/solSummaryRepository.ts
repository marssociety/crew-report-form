import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface SolSummaryReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  summaryTitle: string;
  missionStatus: string;
  solActivitySummary: string;
  lookAheadPlan: string;
  anomalies: string;
  weather: string;
  crewPhysicalStatus: string;
  eva: string;
  reportsToBeFiled: string;
  supportRequested: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class SolSummaryRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: SolSummaryReport): Promise<string> {
    const reportId = report.id || uuidv4();

    await this.db.run(`
      INSERT INTO sol_summary_reports (
        id, crew_number, position, prepared_by, report_date, sol,
        summary_title, mission_status, sol_activity_summary, look_ahead_plan,
        anomalies, weather, crew_physical_status, eva, reports_to_be_filed,
        support_requested, email_subject, email_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      report.crewNumber,
      report.position,
      report.preparedBy,
      report.reportDate,
      report.sol,
      report.summaryTitle,
      report.missionStatus,
      report.solActivitySummary,
      report.lookAheadPlan,
      report.anomalies,
      report.weather,
      report.crewPhysicalStatus,
      report.eva,
      report.reportsToBeFiled,
      report.supportRequested,
      report.emailSubject || null,
      report.emailBody || null
    ]);

    return reportId;
  }

  async findById(id: string): Promise<SolSummaryReport | null> {
    const report = await this.db.get(`
      SELECT * FROM sol_summary_reports WHERE id = ?
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
      summaryTitle: report.summary_title,
      missionStatus: report.mission_status,
      solActivitySummary: report.sol_activity_summary,
      lookAheadPlan: report.look_ahead_plan,
      anomalies: report.anomalies,
      weather: report.weather,
      crewPhysicalStatus: report.crew_physical_status,
      eva: report.eva,
      reportsToBeFiled: report.reports_to_be_filed,
      supportRequested: report.support_requested,
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<SolSummaryReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM sol_summary_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: SolSummaryReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<SolSummaryReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM sol_summary_reports
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: SolSummaryReport[] = [];

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
      DELETE FROM sol_summary_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
