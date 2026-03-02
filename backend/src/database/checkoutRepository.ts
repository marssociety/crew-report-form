import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface CheckoutChecklist {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  damages: string;
  repairEstimate: string;
  cleaningFeeEstimate: string;
  cleaningFeeActual: string;
  items: Array<{
    section: string;
    itemDescription: string;
    crewConfirmed: string;
    staffConfirmed: string;
    notes: string;
  }>;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class CheckoutRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: CheckoutChecklist): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO checkout_checklists (
          id, crew_number, position, prepared_by, report_date, sol,
          damages, repair_estimate, cleaning_fee_estimate, cleaning_fee_actual,
          email_subject, email_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId,
        report.crewNumber,
        report.position,
        report.preparedBy,
        report.reportDate,
        report.sol,
        report.damages,
        report.repairEstimate,
        report.cleaningFeeEstimate,
        report.cleaningFeeActual,
        report.emailSubject || null,
        report.emailBody || null
      ]);

      // Insert checkout items
      for (const item of report.items) {
        await this.db.run(`
          INSERT INTO checkout_items (
            checklist_id, section, item_description, crew_confirmed,
            staff_confirmed, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          reportId,
          item.section,
          item.itemDescription,
          item.crewConfirmed,
          item.staffConfirmed,
          item.notes
        ]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<CheckoutChecklist | null> {
    const report = await this.db.get(`
      SELECT * FROM checkout_checklists WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get checkout items
    const items = await this.db.all(`
      SELECT * FROM checkout_items
      WHERE checklist_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      damages: report.damages,
      repairEstimate: report.repair_estimate,
      cleaningFeeEstimate: report.cleaning_fee_estimate,
      cleaningFeeActual: report.cleaning_fee_actual,
      items: items.map((i: any) => ({
        section: i.section,
        itemDescription: i.item_description,
        crewConfirmed: i.crew_confirmed,
        staffConfirmed: i.staff_confirmed,
        notes: i.notes
      })),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<CheckoutChecklist[]> {
    const reports = await this.db.all(`
      SELECT * FROM checkout_checklists ORDER BY report_date DESC, sol DESC
    `);

    const result: CheckoutChecklist[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<CheckoutChecklist[]> {
    const reports = await this.db.all(`
      SELECT * FROM checkout_checklists
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: CheckoutChecklist[] = [];

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
      DELETE FROM checkout_checklists WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
