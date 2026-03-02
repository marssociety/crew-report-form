import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface FoodInventory {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  items: Array<{
    foodType: string;
    itemName: string;
    startingAmount: string;
    unit: string;
    weightLbs: string;
    remainingFraction: string;
  }>;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class FoodInventoryRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: FoodInventory): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO food_inventories (
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

      // Insert food inventory items
      for (const item of report.items) {
        await this.db.run(`
          INSERT INTO food_inventory_items (
            inventory_id, food_type, item_name, starting_amount,
            unit, weight_lbs, remaining_fraction
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          reportId,
          item.foodType,
          item.itemName,
          item.startingAmount,
          item.unit,
          item.weightLbs,
          item.remainingFraction
        ]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<FoodInventory | null> {
    const report = await this.db.get(`
      SELECT * FROM food_inventories WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get food inventory items
    const items = await this.db.all(`
      SELECT * FROM food_inventory_items
      WHERE inventory_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      items: items.map((i: any) => ({
        foodType: i.food_type,
        itemName: i.item_name,
        startingAmount: i.starting_amount,
        unit: i.unit,
        weightLbs: i.weight_lbs,
        remainingFraction: i.remaining_fraction
      })),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<FoodInventory[]> {
    const reports = await this.db.all(`
      SELECT * FROM food_inventories ORDER BY report_date DESC, sol DESC
    `);

    const result: FoodInventory[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<FoodInventory[]> {
    const reports = await this.db.all(`
      SELECT * FROM food_inventories
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: FoodInventory[] = [];

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
      DELETE FROM food_inventories WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
