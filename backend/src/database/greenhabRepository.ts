import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface GreenHabReport {
  id?: string;
  crewNumber: string;
  position: string;
  reportPreparedBy: string;
  reportDate: string;
  sol: number;
  environmentalControl: string;
  avgTemperature: string;
  maxTemperature: string;
  minTemperature: string;
  supplementalLightHours: number;
  dailyWaterUsageCrops: string;
  dailyWaterUsageOther?: string;
  blueTankRemaining: number;
  wateringTimes: string[];
  cropsChanges?: string;
  narrative: string;
  harvests: Array<{ crop: string; mass: string }>;
  supportNeeded?: string;
  attachedPictures: boolean;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class GreenHabRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: GreenHabReport): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO greenhab_reports (
          id, crew_number, position, report_prepared_by, report_date, sol,
          environmental_control, avg_temperature, max_temperature, min_temperature,
          supplemental_light_hours, daily_water_usage_crops, daily_water_usage_other,
          blue_tank_remaining, crops_changes, narrative, support_needed,
          attached_pictures, email_subject, email_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId,
        report.crewNumber,
        report.position,
        report.reportPreparedBy,
        report.reportDate,
        report.sol,
        report.environmentalControl,
        report.avgTemperature,
        report.maxTemperature,
        report.minTemperature,
        report.supplementalLightHours,
        report.dailyWaterUsageCrops,
        report.dailyWaterUsageOther || null,
        report.blueTankRemaining,
        report.cropsChanges || null,
        report.narrative,
        report.supportNeeded || null,
        report.attachedPictures,
        report.emailSubject || null,
        report.emailBody || null
      ]);

      // Insert watering times
      for (const time of report.wateringTimes.filter(t => t.trim())) {
        await this.db.run(`
          INSERT INTO greenhab_watering_times (report_id, watering_time)
          VALUES (?, ?)
        `, [reportId, time]);
      }

      // Insert harvest data
      for (const harvest of report.harvests.filter(h => h.crop || h.mass)) {
        await this.db.run(`
          INSERT INTO greenhab_harvests (report_id, crop_type, mass_grams)
          VALUES (?, ?, ?)
        `, [reportId, harvest.crop, parseFloat(harvest.mass) || 0]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<GreenHabReport | null> {
    const report = await this.db.get(`
      SELECT * FROM greenhab_reports WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get watering times
    const wateringTimes = await this.db.all(`
      SELECT watering_time FROM greenhab_watering_times 
      WHERE report_id = ? ORDER BY id
    `, [id]);

    // Get harvest data
    const harvests = await this.db.all(`
      SELECT crop_type, mass_grams FROM greenhab_harvests 
      WHERE report_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      reportPreparedBy: report.report_prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      environmentalControl: report.environmental_control,
      avgTemperature: report.avg_temperature,
      maxTemperature: report.max_temperature,
      minTemperature: report.min_temperature,
      supplementalLightHours: report.supplemental_light_hours,
      dailyWaterUsageCrops: report.daily_water_usage_crops,
      dailyWaterUsageOther: report.daily_water_usage_other,
      blueTankRemaining: report.blue_tank_remaining,
      wateringTimes: wateringTimes.map((wt: any) => wt.watering_time),
      cropsChanges: report.crops_changes,
      narrative: report.narrative,
      harvests: harvests.map((h: any) => ({
        crop: h.crop_type,
        mass: h.mass_grams.toString()
      })),
      supportNeeded: report.support_needed,
      attachedPictures: Boolean(report.attached_pictures),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<GreenHabReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM greenhab_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: GreenHabReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<GreenHabReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM greenhab_reports 
      WHERE crew_number = ? 
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: GreenHabReport[] = [];

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
      DELETE FROM greenhab_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}