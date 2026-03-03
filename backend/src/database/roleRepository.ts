import Database from './database';

export interface RoleRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export class RoleRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async findAll(): Promise<RoleRow[]> {
    const result = await this.db.query('SELECT * FROM roles ORDER BY name ASC');
    return result.rows;
  }

  async findById(id: number): Promise<RoleRow | null> {
    const result = await this.db.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<RoleRow | null> {
    const result = await this.db.query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0] || null;
  }
}

export default RoleRepository;
