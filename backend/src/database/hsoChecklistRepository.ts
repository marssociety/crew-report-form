import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface HsoChecklist {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  stairsFunctional: string;
  emergencyWindowFunctional: string;
  commandersWindowFunctional: string;
  firstAidInventory: string;
  safetyIssues: string;
  healthEnvironmentalIssues: string;
  missingRecommendedSupplies: string;
  equipmentNotes: string;
  equipmentChecks: Array<{
    equipmentType: string;
    location: string;
    confirmed: string;
    notes: string;
  }>;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class HsoChecklistRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: HsoChecklist): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO hso_checklists (
          id, crew_number, position, prepared_by, report_date, sol,
          stairs_functional, emergency_window_functional, commanders_window_functional,
          first_aid_inventory, safety_issues, health_environmental_issues,
          missing_recommended_supplies, equipment_notes, email_subject, email_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId,
        report.crewNumber,
        report.position,
        report.preparedBy,
        report.reportDate,
        report.sol,
        report.stairsFunctional,
        report.emergencyWindowFunctional,
        report.commandersWindowFunctional,
        report.firstAidInventory,
        report.safetyIssues,
        report.healthEnvironmentalIssues,
        report.missingRecommendedSupplies,
        report.equipmentNotes,
        report.emailSubject || null,
        report.emailBody || null
      ]);

      // Insert equipment checks
      for (const check of report.equipmentChecks) {
        await this.db.run(`
          INSERT INTO hso_equipment_checks (
            checklist_id, equipment_type, location, confirmed, notes
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          reportId,
          check.equipmentType,
          check.location,
          check.confirmed,
          check.notes
        ]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<HsoChecklist | null> {
    const report = await this.db.get(`
      SELECT * FROM hso_checklists WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get equipment checks
    const equipmentChecks = await this.db.all(`
      SELECT * FROM hso_equipment_checks
      WHERE checklist_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      stairsFunctional: report.stairs_functional,
      emergencyWindowFunctional: report.emergency_window_functional,
      commandersWindowFunctional: report.commanders_window_functional,
      firstAidInventory: report.first_aid_inventory,
      safetyIssues: report.safety_issues,
      healthEnvironmentalIssues: report.health_environmental_issues,
      missingRecommendedSupplies: report.missing_recommended_supplies,
      equipmentNotes: report.equipment_notes,
      equipmentChecks: equipmentChecks.map((ec: any) => ({
        equipmentType: ec.equipment_type,
        location: ec.location,
        confirmed: ec.confirmed,
        notes: ec.notes
      })),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<HsoChecklist[]> {
    const reports = await this.db.all(`
      SELECT * FROM hso_checklists ORDER BY report_date DESC, sol DESC
    `);

    const result: HsoChecklist[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<HsoChecklist[]> {
    const reports = await this.db.all(`
      SELECT * FROM hso_checklists
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: HsoChecklist[] = [];

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
      DELETE FROM hso_checklists WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
