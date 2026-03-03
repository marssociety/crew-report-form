import Database from './database';

export interface ReportInput {
  report_type: string;
  title?: string;
  author?: string;
  position?: string;
  station?: string;
  mission_name?: string;
  crew_number: string;
  crew_id?: number;
  mission_type?: string;
  mission_start_date?: string;
  mission_duration_day?: number;
  report_date: string;
  sol?: number;
  content?: string;
  report_data?: Record<string, unknown>;
  email_subject?: string;
  email_body?: string;
}

export interface ReportRow {
  id: string;
  report_type: string;
  title: string | null;
  author: string | null;
  position: string | null;
  station: string | null;
  mission_name: string | null;
  crew_number: string;
  crew_id: number | null;
  mission_type: string | null;
  mission_start_date: string | null;
  mission_duration_day: number | null;
  report_date: string;
  sol: number | null;
  content: string | null;
  report_data: Record<string, unknown>;
  email_subject: string | null;
  email_body: string | null;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
}

export class ReportRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(input: ReportInput): Promise<string> {
    const sql = `
      INSERT INTO reports (
        report_type, title, author, position, station, mission_name,
        crew_number, crew_id, mission_type, mission_start_date, mission_duration_day,
        report_date, sol, content, report_data, email_subject, email_body
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17
      ) RETURNING id
    `;

    const params = [
      input.report_type,
      input.title || null,
      input.author || null,
      input.position || null,
      input.station || 'MDRS',
      input.mission_name || null,
      input.crew_number,
      input.crew_id ?? null,
      input.mission_type || null,
      input.mission_start_date || null,
      input.mission_duration_day ?? null,
      input.report_date,
      input.sol ?? null,
      input.content || null,
      JSON.stringify(input.report_data || {}),
      input.email_subject || null,
      input.email_body || null,
    ];

    const result = await this.db.query(sql, params);
    return result.rows[0].id;
  }

  async findById(id: string): Promise<ReportRow | null> {
    const result = await this.db.query(
      'SELECT * FROM reports WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByType(reportType: string): Promise<ReportRow[]> {
    const result = await this.db.query(
      'SELECT * FROM reports WHERE report_type = $1 ORDER BY created_at DESC',
      [reportType]
    );
    return result.rows;
  }

  async findByTypeAndCrewNumber(reportType: string, crewNumber: string): Promise<ReportRow[]> {
    const result = await this.db.query(
      'SELECT * FROM reports WHERE report_type = $1 AND crew_number = $2 ORDER BY created_at DESC',
      [reportType, crewNumber]
    );
    return result.rows;
  }

  async findAll(): Promise<ReportRow[]> {
    const result = await this.db.query(
      'SELECT * FROM reports ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async findByCrewId(crewId: number): Promise<ReportRow[]> {
    const result = await this.db.query(
      'SELECT * FROM reports WHERE crew_id = $1 ORDER BY report_date DESC, sol DESC',
      [crewId]
    );
    return result.rows;
  }

  async search(query: string): Promise<ReportRow[]> {
    const result = await this.db.query(
      `SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
       FROM reports
       WHERE search_vector @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 50`,
      [query]
    );
    return result.rows;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM reports WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export default ReportRepository;
