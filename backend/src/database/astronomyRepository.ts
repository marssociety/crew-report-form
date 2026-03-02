import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface AstronomyReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  roboticTelescopeRequested: string;
  objectsToBeImaged: string;
  roboticImagesSubmitted: string;
  roboticProblemsEncountered: string;
  solarFeaturesObserved: string;
  muskImagesSubmitted: string;
  muskProblemsEncountered: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class AstronomyRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: AstronomyReport): Promise<string> {
    const reportId = report.id || uuidv4();

    await this.db.run(`
      INSERT INTO astronomy_reports (
        id, crew_number, position, prepared_by, report_date, sol,
        robotic_telescope_requested, objects_to_be_imaged, robotic_images_submitted,
        robotic_problems_encountered, solar_features_observed, musk_images_submitted,
        musk_problems_encountered, email_subject, email_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      report.crewNumber,
      report.position,
      report.preparedBy,
      report.reportDate,
      report.sol,
      report.roboticTelescopeRequested,
      report.objectsToBeImaged,
      report.roboticImagesSubmitted,
      report.roboticProblemsEncountered,
      report.solarFeaturesObserved,
      report.muskImagesSubmitted,
      report.muskProblemsEncountered,
      report.emailSubject || null,
      report.emailBody || null
    ]);

    return reportId;
  }

  async findById(id: string): Promise<AstronomyReport | null> {
    const report = await this.db.get(`
      SELECT * FROM astronomy_reports WHERE id = ?
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
      roboticTelescopeRequested: report.robotic_telescope_requested,
      objectsToBeImaged: report.objects_to_be_imaged,
      roboticImagesSubmitted: report.robotic_images_submitted,
      roboticProblemsEncountered: report.robotic_problems_encountered,
      solarFeaturesObserved: report.solar_features_observed,
      muskImagesSubmitted: report.musk_images_submitted,
      muskProblemsEncountered: report.musk_problems_encountered,
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<AstronomyReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM astronomy_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: AstronomyReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<AstronomyReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM astronomy_reports
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: AstronomyReport[] = [];

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
      DELETE FROM astronomy_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
