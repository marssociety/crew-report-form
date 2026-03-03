import Database from './database';

export interface EquipmentInput {
  equipment_id?: string;
  equipment_type?: string;
  equipment_name?: string;
  description?: string;
  first_used?: string;
  last_used?: string;
  usage_count?: number;
}

export interface EquipmentRow {
  id: number;
  equipment_id: string | null;
  equipment_type: string | null;
  equipment_name: string | null;
  description: string | null;
  first_used: string | null;
  last_used: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export class EquipmentRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(input: EquipmentInput): Promise<number> {
    const sql = `
      INSERT INTO equipment (equipment_id, equipment_type, equipment_name, description, first_used, last_used, usage_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const params = [
      input.equipment_id || null,
      input.equipment_type || null,
      input.equipment_name || null,
      input.description || null,
      input.first_used || null,
      input.last_used || null,
      input.usage_count ?? 0,
    ];
    const result = await this.db.query(sql, params);
    return result.rows[0].id;
  }

  async findById(id: number): Promise<EquipmentRow | null> {
    const result = await this.db.query('SELECT * FROM equipment WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<EquipmentRow[]> {
    const result = await this.db.query('SELECT * FROM equipment ORDER BY equipment_type ASC, equipment_name ASC');
    return result.rows;
  }

  async update(id: number, input: Partial<EquipmentInput>): Promise<EquipmentRow | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.equipment_id !== undefined) { fields.push(`equipment_id = $${idx++}`); params.push(input.equipment_id); }
    if (input.equipment_type !== undefined) { fields.push(`equipment_type = $${idx++}`); params.push(input.equipment_type); }
    if (input.equipment_name !== undefined) { fields.push(`equipment_name = $${idx++}`); params.push(input.equipment_name); }
    if (input.description !== undefined) { fields.push(`description = $${idx++}`); params.push(input.description); }
    if (input.first_used !== undefined) { fields.push(`first_used = $${idx++}`); params.push(input.first_used); }
    if (input.last_used !== undefined) { fields.push(`last_used = $${idx++}`); params.push(input.last_used); }
    if (input.usage_count !== undefined) { fields.push(`usage_count = $${idx++}`); params.push(input.usage_count); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE equipment SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await this.db.query(sql, params);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM equipment WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default EquipmentRepository;
