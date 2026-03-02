import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface PhotosReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  photos: Array<{
    filename: string;
    originalName: string;
    caption: string;
    filePath: string;
  }>;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class PhotosRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: PhotosReport): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO photos_of_the_day (
          id, crew_number, position, prepared_by, report_date, sol,
          email_subject, email_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId,
        report.crewNumber,
        report.position,
        report.preparedBy,
        report.reportDate,
        report.sol,
        report.emailSubject || null,
        report.emailBody || null
      ]);

      // Insert photo attachments
      for (const photo of report.photos) {
        await this.db.run(`
          INSERT INTO photo_attachments (
            photos_report_id, filename, original_name, caption, file_path
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          reportId,
          photo.filename,
          photo.originalName,
          photo.caption,
          photo.filePath
        ]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<PhotosReport | null> {
    const report = await this.db.get(`
      SELECT * FROM photos_of_the_day WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get photo attachments
    const photos = await this.db.all(`
      SELECT * FROM photo_attachments
      WHERE photos_report_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      photos: photos.map((p: any) => ({
        filename: p.filename,
        originalName: p.original_name,
        caption: p.caption,
        filePath: p.file_path
      })),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<PhotosReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM photos_of_the_day ORDER BY report_date DESC, sol DESC
    `);

    const result: PhotosReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<PhotosReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM photos_of_the_day
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: PhotosReport[] = [];

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
      DELETE FROM photos_of_the_day WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
