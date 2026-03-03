import Database from './database';

export interface CrewInput {
  crew_number: string;
  crew_rotation_order?: number;
  crew_name?: string;
  start_date?: string;
  end_date?: string;
  patch_url?: string;
  mission_plan_report_id?: string;
  mission_summary_report_id?: string;
}

export interface CrewRow {
  id: number;
  crew_number: string;
  crew_rotation_order: number | null;
  crew_name: string | null;
  start_date: string | null;
  end_date: string | null;
  patch_url: string | null;
  mission_plan_report_id: string | null;
  mission_summary_report_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RosterRow {
  crew_id: number;
  crew_number: string;
  crew_name: string | null;
  start_date: string | null;
  end_date: string | null;
  crew_member_id: number;
  member_name: string;
  member_email: string | null;
  member_affiliation: string | null;
  role_name: string;
  role_description: string | null;
}

export class CrewRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(input: CrewInput): Promise<number> {
    const sql = `
      INSERT INTO crews (
        crew_number, crew_rotation_order, crew_name,
        start_date, end_date, patch_url,
        mission_plan_report_id, mission_summary_report_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const params = [
      input.crew_number,
      input.crew_rotation_order ?? null,
      input.crew_name || null,
      input.start_date || null,
      input.end_date || null,
      input.patch_url || null,
      input.mission_plan_report_id || null,
      input.mission_summary_report_id || null,
    ];
    const result = await this.db.query(sql, params);
    return result.rows[0].id;
  }

  async findById(id: number): Promise<CrewRow | null> {
    const result = await this.db.query('SELECT * FROM crews WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByCrewNumber(crewNumber: string): Promise<CrewRow | null> {
    const result = await this.db.query('SELECT * FROM crews WHERE crew_number = $1', [crewNumber]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<CrewRow[]> {
    const result = await this.db.query('SELECT * FROM crews ORDER BY crew_rotation_order ASC NULLS LAST, crew_number ASC');
    return result.rows;
  }

  async update(id: number, input: Partial<CrewInput>): Promise<CrewRow | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.crew_number !== undefined) { fields.push(`crew_number = $${idx++}`); params.push(input.crew_number); }
    if (input.crew_rotation_order !== undefined) { fields.push(`crew_rotation_order = $${idx++}`); params.push(input.crew_rotation_order); }
    if (input.crew_name !== undefined) { fields.push(`crew_name = $${idx++}`); params.push(input.crew_name); }
    if (input.start_date !== undefined) { fields.push(`start_date = $${idx++}`); params.push(input.start_date); }
    if (input.end_date !== undefined) { fields.push(`end_date = $${idx++}`); params.push(input.end_date); }
    if (input.patch_url !== undefined) { fields.push(`patch_url = $${idx++}`); params.push(input.patch_url); }
    if (input.mission_plan_report_id !== undefined) { fields.push(`mission_plan_report_id = $${idx++}`); params.push(input.mission_plan_report_id); }
    if (input.mission_summary_report_id !== undefined) { fields.push(`mission_summary_report_id = $${idx++}`); params.push(input.mission_summary_report_id); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE crews SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await this.db.query(sql, params);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM crews WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findRoster(crewId: number): Promise<RosterRow[]> {
    const result = await this.db.query(
      'SELECT * FROM crew_rosters WHERE crew_id = $1',
      [crewId]
    );
    return result.rows;
  }
}

export default CrewRepository;
