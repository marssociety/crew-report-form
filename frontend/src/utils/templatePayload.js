/**
 * Utility to build template-format payloads for form submissions.
 *
 * Converts the flat camelCase form data into the official crew-report-template
 * format with envelope fields + role_specific_data (snake_case).
 *
 * @see https://github.com/marssociety/crew-report-template
 */

// Convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Recursively convert object keys from camelCase to snake_case, applying aliases
function convertKeysToSnake(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnake);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      const finalKey = FIELD_ALIASES[snakeKey] || snakeKey;
      result[finalKey] = convertKeysToSnake(value);
    }
    return result;
  }
  return obj;
}

// Fields that belong in the envelope, not in role_specific_data
const ENVELOPE_FIELDS = new Set([
  'crewNumber', 'position', 'reportPreparedBy', 'date', 'sol',
  'reportDate', 'reportType', 'emailSubject', 'emailBody', 'submittedAt'
]);

// Map form field names (camelCase) to schema field names (snake_case)
// where the automatic camelToSnake conversion doesn't produce the right name
const FIELD_ALIASES = {
  'purpose_of_eva': 'purpose',
  'attached_pictures': 'attached_pictures',
};

/**
 * Build a template-format payload from form data.
 *
 * @param {Object} formData - The raw form data (camelCase)
 * @param {string} reportType - The report_type enum value (e.g., 'sol_summary')
 * @param {string} emailSubject - Generated email subject
 * @param {string} emailBody - Generated email body
 * @returns {Object} Template-format payload ready to POST
 */
export function buildTemplatePayload(formData, reportType, emailSubject, emailBody) {
  // Separate envelope fields from role-specific fields
  const roleSpecificData = {};

  for (const [key, value] of Object.entries(formData)) {
    if (!ENVELOPE_FIELDS.has(key)) {
      roleSpecificData[key] = value;
    }
  }

  return {
    report_type: reportType,
    crew_number: String(formData.crewNumber || ''),
    author: formData.reportPreparedBy || '',
    position: formData.position || '',
    report_date: formData.date || formData.reportDate || '',
    sol: Number(formData.sol) || 0,
    role_specific_data: convertKeysToSnake(roleSpecificData),
    email_subject: emailSubject || '',
    email_body: emailBody || '',
  };
}
