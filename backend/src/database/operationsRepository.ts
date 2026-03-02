import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface OperationsReport {
  id?: string;
  crewNumber: string;
  position: string;
  preparedBy: string;
  reportDate: string;
  sol: number;
  nonNominalSystems: string;
  notesOnNonNominal: string;
  generalNotesOnRovers: string;
  summaryOfHabOperations: string;
  waterUse: string;
  mainTankLevel: string;
  mainWaterTankPipeHeater: string;
  mainWaterTankHeater: string;
  toiletTankEmptied: string;
  summaryOfInternet: string;
  summaryOfSuitsAndRadios: string;
  summaryOfGreenhab: string;
  greenhabWaterUseGallons: string;
  greenhabHeater: string;
  greenhabSupplementalLight: string;
  greenhabHarvest: string;
  summaryOfSciencedome: string;
  dualSplit: string;
  summaryOfRam: string;
  summaryOfObservatory: string;
  summaryOfHealthSafety: string;
  questionsToMissionSupport: string;
  rovers: Array<{
    roverName: string;
    roverUsed: string;
    hours: string;
    beginningCharge: string;
    endingCharge: string;
    currentlyCharging: string;
  }>;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
}

export class OperationsRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(report: OperationsReport): Promise<string> {
    const reportId = report.id || uuidv4();

    return await this.db.transaction(async () => {
      // Insert main report
      await this.db.run(`
        INSERT INTO operations_reports (
          id, crew_number, position, prepared_by, report_date, sol,
          non_nominal_systems, notes_on_non_nominal, general_notes_on_rovers,
          summary_of_hab_operations, water_use, main_tank_level,
          main_water_tank_pipe_heater, main_water_tank_heater, toilet_tank_emptied,
          summary_of_internet, summary_of_suits_and_radios, summary_of_greenhab,
          greenhab_water_use_gallons, greenhab_heater, greenhab_supplemental_light,
          greenhab_harvest, summary_of_sciencedome, dual_split, summary_of_ram,
          summary_of_observatory, summary_of_health_safety, questions_to_mission_support,
          email_subject, email_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reportId,
        report.crewNumber,
        report.position,
        report.preparedBy,
        report.reportDate,
        report.sol,
        report.nonNominalSystems,
        report.notesOnNonNominal,
        report.generalNotesOnRovers,
        report.summaryOfHabOperations,
        report.waterUse,
        report.mainTankLevel,
        report.mainWaterTankPipeHeater,
        report.mainWaterTankHeater,
        report.toiletTankEmptied,
        report.summaryOfInternet,
        report.summaryOfSuitsAndRadios,
        report.summaryOfGreenhab,
        report.greenhabWaterUseGallons,
        report.greenhabHeater,
        report.greenhabSupplementalLight,
        report.greenhabHarvest,
        report.summaryOfSciencedome,
        report.dualSplit,
        report.summaryOfRam,
        report.summaryOfObservatory,
        report.summaryOfHealthSafety,
        report.questionsToMissionSupport,
        report.emailSubject || null,
        report.emailBody || null
      ]);

      // Insert rover readings
      for (const rover of report.rovers) {
        await this.db.run(`
          INSERT INTO operations_rover_readings (
            operations_report_id, rover_name, rover_used, hours,
            beginning_charge, ending_charge, currently_charging
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          reportId,
          rover.roverName,
          rover.roverUsed,
          rover.hours,
          rover.beginningCharge,
          rover.endingCharge,
          rover.currentlyCharging
        ]);
      }

      return reportId;
    });
  }

  async findById(id: string): Promise<OperationsReport | null> {
    const report = await this.db.get(`
      SELECT * FROM operations_reports WHERE id = ?
    `, [id]);

    if (!report) {
      return null;
    }

    // Get rover readings
    const rovers = await this.db.all(`
      SELECT * FROM operations_rover_readings
      WHERE operations_report_id = ? ORDER BY id
    `, [id]);

    return {
      id: report.id,
      crewNumber: report.crew_number,
      position: report.position,
      preparedBy: report.prepared_by,
      reportDate: report.report_date,
      sol: report.sol,
      nonNominalSystems: report.non_nominal_systems,
      notesOnNonNominal: report.notes_on_non_nominal,
      generalNotesOnRovers: report.general_notes_on_rovers,
      summaryOfHabOperations: report.summary_of_hab_operations,
      waterUse: report.water_use,
      mainTankLevel: report.main_tank_level,
      mainWaterTankPipeHeater: report.main_water_tank_pipe_heater,
      mainWaterTankHeater: report.main_water_tank_heater,
      toiletTankEmptied: report.toilet_tank_emptied,
      summaryOfInternet: report.summary_of_internet,
      summaryOfSuitsAndRadios: report.summary_of_suits_and_radios,
      summaryOfGreenhab: report.summary_of_greenhab,
      greenhabWaterUseGallons: report.greenhab_water_use_gallons,
      greenhabHeater: report.greenhab_heater,
      greenhabSupplementalLight: report.greenhab_supplemental_light,
      greenhabHarvest: report.greenhab_harvest,
      summaryOfSciencedome: report.summary_of_sciencedome,
      dualSplit: report.dual_split,
      summaryOfRam: report.summary_of_ram,
      summaryOfObservatory: report.summary_of_observatory,
      summaryOfHealthSafety: report.summary_of_health_safety,
      questionsToMissionSupport: report.questions_to_mission_support,
      rovers: rovers.map((r: any) => ({
        roverName: r.rover_name,
        roverUsed: r.rover_used,
        hours: r.hours,
        beginningCharge: r.beginning_charge,
        endingCharge: r.ending_charge,
        currentlyCharging: r.currently_charging
      })),
      emailSubject: report.email_subject,
      emailBody: report.email_body,
      createdAt: report.created_at
    };
  }

  async findAll(): Promise<OperationsReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM operations_reports ORDER BY report_date DESC, sol DESC
    `);

    const result: OperationsReport[] = [];

    for (const report of reports) {
      const fullReport = await this.findById(report.id);
      if (fullReport) {
        result.push(fullReport);
      }
    }

    return result;
  }

  async findByCrewNumber(crewNumber: string): Promise<OperationsReport[]> {
    const reports = await this.db.all(`
      SELECT * FROM operations_reports
      WHERE crew_number = ?
      ORDER BY report_date DESC, sol DESC
    `, [crewNumber]);

    const result: OperationsReport[] = [];

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
      DELETE FROM operations_reports WHERE id = ?
    `, [id]);

    return result.changes > 0;
  }
}
