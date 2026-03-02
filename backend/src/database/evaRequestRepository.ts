import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface EvaRequest {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  evaNumber: string;
  requestDate: string;
  requestedEvaDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  weatherSupportsEva: string;
  purpose: string;
  destination: string;
  coordinates: string;
  participants: string;
  routes: string;
  modeOfTravel: string;
  vehicles: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class EvaRequestRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: EvaRequest): Promise<string> {
    const reportId = report.id || uuidv4();

    await this.db.run(`
      INSERT INTO eva_requests (
        id, crew_number, position, prepared_by, report_date, sol,
        eva_number, request_date, requested_eva_date, requested_start_time,
        requested_end_time, weather_supports_eva, purpose, destination,
        coordinates, participants, routes, mode_of_travel, vehicles,
        email_subject, email_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportId,
      report.crewNumber,
      report.position,
      report.preparedBy,
      report.reportDate,
      report.sol,
      report.evaNumber,
      report.requestDate,
      report.requestedEvaDate,
      report.requestedStartTime,
      report.requestedEndTime,
      report.weatherSupportsEva,
      report.purpose,
      report.destination,
      report.coordinates,
      report.participants,
      report.routes,
      report.modeOfTravel,
      report.vehicles,
      report.emailSubject || null,
      report.emailBody || null
    ]);

    return reportId;
  }

  async findById(id: string): Promise<EvaRequest | null> {
    const report = await this.db.get(`
      SELECT * FROM eva_requests WHERE id = ?
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
      requestDate: report.request_date,
      requestedEvaDate: report.requested_eva_date,
      requestedStartTime: report.requested_start_time,
      requestedEndTime: report.requested_end_time,
      weatherSupportsEva: report.weather_supports_eva,
      purpose: report.purpose,
      destination: report.destination,
      coordinates: report.coordinates,
      participants: report.participants,
      routes: report.routes,
      modeOfTravel: report.mode_of_travel,
      vehicles: report.vehicles,
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<EvaRequest[]> {
    const reports = await this.db.all(`
      SELECT * FROM eva_requests ORDER BY report_date DESC, sol DESC
    `);

    const result: EvaRequest[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<EvaRequest[]> {
    const reports = await this.db.all(`
      SELECT * FROM eva_requests
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: EvaRequest[] = [];

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
      DELETE FROM eva_requests WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
