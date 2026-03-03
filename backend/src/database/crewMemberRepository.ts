import Database from './database';

export interface CrewMemberInput {
  name: string;
  normalized_name?: string;
  email?: string;
  bio?: string;
  affiliation?: string;
}

export interface CrewMemberRow {
  id: number;
  name: string;
  normalized_name: string | null;
  email: string | null;
  bio: string | null;
  affiliation: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberHistoryRow {
  crew_member_id: number;
  member_name: string;
  email: string | null;
  affiliation: string | null;
  crew_id: number;
  crew_number: string;
  crew_name: string | null;
  start_date: string | null;
  end_date: string | null;
  role_name: string;
  role_description: string | null;
}

export class CrewMemberRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(input: CrewMemberInput): Promise<number> {
    const normalizedName = input.normalized_name || input.name.toLowerCase().trim();
    const sql = `
      INSERT INTO crew_members (name, normalized_name, email, bio, affiliation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const params = [
      input.name,
      normalizedName,
      input.email || null,
      input.bio || null,
      input.affiliation || null,
    ];
    const result = await this.db.query(sql, params);
    return result.rows[0].id;
  }

  async findById(id: number): Promise<CrewMemberRow | null> {
    const result = await this.db.query('SELECT * FROM crew_members WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<CrewMemberRow[]> {
    const result = await this.db.query(
      'SELECT * FROM crew_members WHERE normalized_name ILIKE $1 ORDER BY name',
      [`%${name.toLowerCase().trim()}%`]
    );
    return result.rows;
  }

  async findAll(): Promise<CrewMemberRow[]> {
    const result = await this.db.query('SELECT * FROM crew_members ORDER BY name ASC');
    return result.rows;
  }

  async update(id: number, input: Partial<CrewMemberInput>): Promise<CrewMemberRow | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(input.name);
      fields.push(`normalized_name = $${idx++}`);
      params.push(input.normalized_name || input.name.toLowerCase().trim());
    }
    if (input.email !== undefined) { fields.push(`email = $${idx++}`); params.push(input.email); }
    if (input.bio !== undefined) { fields.push(`bio = $${idx++}`); params.push(input.bio); }
    if (input.affiliation !== undefined) { fields.push(`affiliation = $${idx++}`); params.push(input.affiliation); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE crew_members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await this.db.query(sql, params);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM crew_members WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findHistory(memberId: number): Promise<MemberHistoryRow[]> {
    const result = await this.db.query(
      'SELECT * FROM crew_member_history WHERE crew_member_id = $1',
      [memberId]
    );
    return result.rows;
  }
}

export default CrewMemberRepository;
