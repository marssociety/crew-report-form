import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import reportSchema from './report_schema.json';

// Canonical (preferred/stored) report_type values per MDRS definitive field specs
const REPORT_TYPES = [
  'sol_summary', 'operations_report', 'greenhab_report', 'eva_report', 'eva_request',
  'journalist_report', 'astronomy_report', 'photos_of_the_day', 'hso_checklist',
  'science_report', 'end_of_mission_report', 'checkout_checklist', 'food_inventory'
] as const;

export type ReportType = typeof REPORT_TYPES[number];

// Short aliases that map to canonical forms.
// Both forms are accepted on input; the canonical form is stored.
const TYPE_ALIASES: Record<string, string> = {
  'operations': 'operations_report',
  'greenhab': 'greenhab_report',
  'journalist': 'journalist_report',
  'astronomy': 'astronomy_report',
  'photos': 'photos_of_the_day',
  'science': 'science_report',
  'end_of_mission': 'end_of_mission_report',
  'checkout': 'checkout_checklist',
};

// Map canonical type → schema definition prefix (when they differ)
const TYPE_TO_DEFINITION: Record<string, string> = {
  'operations_report': 'operations',
  'greenhab_report': 'greenhab',
  'journalist_report': 'journalist',
  'astronomy_report': 'astronomy',
  'photos_of_the_day': 'photos',
  'science_report': 'science',
  'end_of_mission_report': 'end_of_mission',
  'checkout_checklist': 'checkout',
};

/**
 * Normalize a report_type to its canonical form.
 * Accepts both short ("operations") and long ("operations_report") forms.
 */
export function normalizeReportType(reportType: string): string {
  return TYPE_ALIASES[reportType] || reportType;
}

// All accepted type values (canonical + aliases)
const ALL_ACCEPTED_TYPES = [...REPORT_TYPES, ...Object.keys(TYPE_ALIASES)];

export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[] | null;
}

// --- AJV instance ---

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
ajv.addSchema(reportSchema, 'report_schema');

// --- Full report validator (validates complete template-format report) ---

const fullReportValidator: ValidateFunction = ajv.compile(reportSchema);

export function validateFullReport(report: unknown): ValidationResult {
  const valid = fullReportValidator(report);
  return { valid: !!valid, errors: valid ? null : fullReportValidator.errors };
}

// --- Per-type role_specific_data validators ---

const typeValidators: Record<string, ValidateFunction> = {};

for (const reportType of REPORT_TYPES) {
  const defPrefix = TYPE_TO_DEFINITION[reportType] || reportType;
  typeValidators[reportType] = ajv.compile({
    $ref: `report_schema#/definitions/${defPrefix}_specific`
  });
}

export function validateRoleSpecificData(
  reportType: string,
  data: unknown
): ValidationResult {
  const canonical = normalizeReportType(reportType);
  if (!REPORT_TYPES.includes(canonical as ReportType)) {
    return {
      valid: false,
      errors: [{
        keyword: 'enum',
        message: `Unknown report_type: ${reportType}. Valid types: ${ALL_ACCEPTED_TYPES.join(', ')}`,
        params: { allowedValues: ALL_ACCEPTED_TYPES },
        instancePath: '/report_type',
        schemaPath: '#/properties/report_type/enum'
      }]
    };
  }

  const validator = typeValidators[canonical];
  const valid = validator(data);
  return { valid: !!valid, errors: valid ? null : validator.errors };
}

// --- Envelope validation (common fields required for all submissions) ---

const REQUIRED_ENVELOPE_FIELDS = ['crew_number', 'report_date', 'report_type'] as const;

export function validateEnvelope(body: Record<string, unknown>): ValidationResult {
  const missing: string[] = [];
  for (const field of REQUIRED_ENVELOPE_FIELDS) {
    if (!body[field] && body[field] !== 0) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      errors: missing.map(field => ({
        keyword: 'required',
        message: `Missing required field: ${field}`,
        params: { missingProperty: field },
        instancePath: '',
        schemaPath: '#/required'
      }))
    };
  }

  return { valid: true, errors: null };
}

// --- Combined validation for incoming submissions ---

export function validateSubmission(body: Record<string, unknown>): ValidationResult {
  // 1. Check envelope fields
  const envelopeResult = validateEnvelope(body);
  if (!envelopeResult.valid) {
    return envelopeResult;
  }

  // 2. Normalize report_type (accept both short and canonical forms)
  const rawType = body.report_type as string;
  const canonicalType = normalizeReportType(rawType);

  if (!REPORT_TYPES.includes(canonicalType as ReportType)) {
    return {
      valid: false,
      errors: [{
        keyword: 'enum',
        message: `Invalid report_type: ${rawType}. Valid types: ${ALL_ACCEPTED_TYPES.join(', ')}`,
        params: { allowedValues: ALL_ACCEPTED_TYPES },
        instancePath: '/report_type',
        schemaPath: '#/properties/report_type/enum'
      }]
    };
  }

  // Update body with canonical type for downstream use
  body.report_type = canonicalType;

  // 3. Validate role_specific_data if present
  if (body.role_specific_data && typeof body.role_specific_data === 'object') {
    return validateRoleSpecificData(canonicalType, body.role_specific_data);
  }

  return { valid: true, errors: null };
}

// --- Exports for route-level use ---

export { REPORT_TYPES, ALL_ACCEPTED_TYPES };
