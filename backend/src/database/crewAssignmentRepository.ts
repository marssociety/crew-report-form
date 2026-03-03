import Database from './database';

export interface CrewAssignmentInput {
  crew_id: number;
  crew_member_id: number;
  role_id: number;
}

export interface CrewAssignmentRow {
  id: number;
  crew_id: number;
  crew_member_id: number;
  role_id: number;
  created_at: string;
}

export class CrewAssignmentRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(input: CrewAssignmentInput): Promise<number> {
    const sql = `
      INSERT INTO crew_assignments (crew_id, crew_member_id, role_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await this.db.query(sql, [input.crew_id, input.crew_member_id, input.role_id]);
    return result.rows[0].id;
  }

  async findByCrewId(crewId: number): Promise<CrewAssignmentRow[]> {
    const result = await this.db.query(
      'SELECT * FROM crew_assignments WHERE crew_id = $1 ORDER BY id',
      [crewId]
    );
    return result.rows;
  }

  async findByMemberId(memberId: number): Promise<CrewAssignmentRow[]> {
    const result = await this.db.query(
      'SELECT * FROM crew_assignments WHERE crew_member_id = $1 ORDER BY id',
      [memberId]
    );
    return result.rows;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM crew_assignments WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default CrewAssignmentRepository;
