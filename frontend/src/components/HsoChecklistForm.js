import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import { buildTemplatePayload } from '../utils/templatePayload';
import './HsoChecklistForm.css';

const EQUIPMENT_TYPES = [
  'Escape ladder',
  'Eyewash',
  'Fire blanket',
  'Fire extinguisher',
  'First Aid',
  'Intercom',
  'Radios (Ch 10 & 22)',
  'Nightlight',
  'CO alarm',
  'Smoke alarm',
  'Propane alarm',
  'EVA Safety Kit'
];

const LOCATIONS = ['HAB Upper', 'HAB Lower', 'RAM', 'GreenHab', 'SciDome'];

const EXPECTED_PLACEMENT = {
  'Escape ladder':        { 'HAB Upper': true, 'HAB Lower': false, 'RAM': false, 'GreenHab': false, 'SciDome': false },
  'Eyewash':              { 'HAB Upper': false, 'HAB Lower': false, 'RAM': false, 'GreenHab': false, 'SciDome': true },
  'Fire blanket':         { 'HAB Upper': true, 'HAB Lower': false, 'RAM': true, 'GreenHab': false, 'SciDome': true },
  'Fire extinguisher':    { 'HAB Upper': true, 'HAB Lower': true, 'RAM': true, 'GreenHab': true, 'SciDome': true },
  'First Aid':            { 'HAB Upper': false, 'HAB Lower': true, 'RAM': false, 'GreenHab': false, 'SciDome': true },
  'Intercom':             { 'HAB Upper': true, 'HAB Lower': false, 'RAM': true, 'GreenHab': true, 'SciDome': true },
  'Radios (Ch 10 & 22)':  { 'HAB Upper': true, 'HAB Lower': true, 'RAM': true, 'GreenHab': true, 'SciDome': true },
  'Nightlight':           { 'HAB Upper': true, 'HAB Lower': true, 'RAM': true, 'GreenHab': false, 'SciDome': true },
  'CO alarm':             { 'HAB Upper': true, 'HAB Lower': true, 'RAM': true, 'GreenHab': true, 'SciDome': true },
  'Smoke alarm':          { 'HAB Upper': true, 'HAB Lower': true, 'RAM': true, 'GreenHab': true, 'SciDome': true },
  'Propane alarm':        { 'HAB Upper': true, 'HAB Lower': true, 'RAM': false, 'GreenHab': false, 'SciDome': false },
  'EVA Safety Kit':       { 'HAB Upper': false, 'HAB Lower': true, 'RAM': false, 'GreenHab': false, 'SciDome': false },
};

const buildEquipmentDefaults = () => {
  const equipment = {};
  EQUIPMENT_TYPES.forEach((type) => {
    equipment[type] = {};
    LOCATIONS.forEach((loc) => {
      if (EXPECTED_PLACEMENT[type][loc]) {
        equipment[type][loc] = false;
      }
    });
  });
  return equipment;
};

const HsoChecklistForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      crewNumber: '',
      position: '',
      reportPreparedBy: '',
      date: new Date().toISOString().split('T')[0],
      sol: '',
      stairsFunctional: '',
      emergencyWindowFunctional: '',
      commandersWindowFunctional: '',
      firstAidInventory: '',
      safetyIssues: '',
      healthEnvironmentalIssues: '',
      missingRecommendedSupplies: '',
      equipment: buildEquipmentDefaults(),
      equipmentNotes: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} HSO Beginning Of Mission Checklist ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    let equipmentSummary = '\nSAFETY EQUIPMENT INVENTORY:\n';
    EQUIPMENT_TYPES.forEach((type) => {
      const confirmed = [];
      const missing = [];
      LOCATIONS.forEach((loc) => {
        if (EXPECTED_PLACEMENT[type][loc]) {
          if (data.equipment && data.equipment[type] && data.equipment[type][loc]) {
            confirmed.push(loc);
          } else {
            missing.push(loc);
          }
        }
      });
      if (confirmed.length > 0 || missing.length > 0) {
        equipmentSummary += `${type}: `;
        if (confirmed.length > 0) equipmentSummary += `Confirmed: ${confirmed.join(', ')}`;
        if (missing.length > 0) {
          if (confirmed.length > 0) equipmentSummary += ' | ';
          equipmentSummary += `NOT confirmed: ${missing.join(', ')}`;
        }
        equipmentSummary += '\n';
      }
    });

    return `Report title: HSO Beginning Of Mission Checklist
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

PART 1: EMERGENCY ESCAPE ROUTES
Stairs functional: ${data.stairsFunctional || 'N/A'}
Emergency window functional: ${data.emergencyWindowFunctional || 'N/A'}
Commander's window functional: ${data.commandersWindowFunctional || 'N/A'}

PART 2: FIRST AID
First aid inventory: ${data.firstAidInventory || 'N/A'}

PART 3: ISSUES
Safety issues: ${data.safetyIssues || 'N/A'}
Health/Environmental issues: ${data.healthEnvironmentalIssues || 'N/A'}
Missing recommended supplies: ${data.missingRecommendedSupplies || 'N/A'}

PART 4: SAFETY EQUIPMENT INVENTORY
${equipmentSummary}
Equipment notes: ${data.equipmentNotes || 'N/A'}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = buildTemplatePayload(
        data, 'hso_checklist',
        generateEmailSubject(),
        generateEmailBody(data)
      );

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/hso-checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'HSO Checklist submitted successfully!' });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ type: 'error', message: errorData.message || 'Failed to submit report' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    const emailContent = `Subject: ${generateEmailSubject()}\n\n${generateEmailBody(watchedData)}`;
    navigator.clipboard.writeText(emailContent);
    alert('Email content copied to clipboard!');
  };

  return (
    <div className="hso-form-container">
      <div className="form-header">
        <h1>HSO Beginning Of Mission Checklist</h1>
        <p>Mars Desert Research Station - Health & Safety Officer Checklist</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="hso-form">
        <SharedHeader register={register} errors={errors} />

        {/* Part 1: Emergency Escape Routes */}
        <section className="form-section">
          <h2>Part 1: Emergency Escape Routes</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stairsFunctional">Stairs Functional</label>
              <input
                type="text"
                id="stairsFunctional"
                {...register('stairsFunctional')}
                placeholder="Status of stairs"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergencyWindowFunctional">Emergency Window Functional</label>
              <input
                type="text"
                id="emergencyWindowFunctional"
                {...register('emergencyWindowFunctional')}
                placeholder="Status of emergency window"
              />
            </div>

            <div className="form-group">
              <label htmlFor="commandersWindowFunctional">Commander's Window Functional</label>
              <input
                type="text"
                id="commandersWindowFunctional"
                {...register('commandersWindowFunctional')}
                placeholder="Status of commander's window"
              />
            </div>
          </div>
        </section>

        {/* Part 2: First Aid */}
        <section className="form-section">
          <h2>Part 2: First Aid</h2>

          <div className="form-group">
            <label htmlFor="firstAidInventory">First Aid Inventory</label>
            <textarea
              id="firstAidInventory"
              {...register('firstAidInventory')}
              placeholder="List first aid supplies and their condition"
              rows="4"
            />
          </div>
        </section>

        {/* Part 3: Issues */}
        <section className="form-section">
          <h2>Part 3: Issues</h2>

          <div className="form-group">
            <label htmlFor="safetyIssues">Safety Issues</label>
            <textarea
              id="safetyIssues"
              {...register('safetyIssues')}
              placeholder="Describe any safety issues observed"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="healthEnvironmentalIssues">Health/Environmental Issues</label>
            <textarea
              id="healthEnvironmentalIssues"
              {...register('healthEnvironmentalIssues')}
              placeholder="Describe any health or environmental issues"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="missingRecommendedSupplies">Missing Recommended Supplies</label>
            <textarea
              id="missingRecommendedSupplies"
              {...register('missingRecommendedSupplies')}
              placeholder="List any missing recommended supplies"
              rows="3"
            />
          </div>
        </section>

        {/* Part 4: Safety Equipment Inventory */}
        <section className="form-section">
          <h2>Part 4: Safety Equipment Inventory</h2>
          <p className="section-description">
            Check each box to confirm the equipment is present and functional at the expected location.
            Only locations where equipment is expected are shown as checkboxes.
          </p>

          <div className="equipment-table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  {LOCATIONS.map((loc) => (
                    <th key={loc}>{loc}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EQUIPMENT_TYPES.map((type) => (
                  <tr key={type}>
                    <td className="equipment-name">{type}</td>
                    {LOCATIONS.map((loc) => (
                      <td key={loc} className="equipment-cell">
                        {EXPECTED_PLACEMENT[type][loc] ? (
                          <input
                            type="checkbox"
                            {...register(`equipment.${type}.${loc}`)}
                          />
                        ) : (
                          <span className="not-applicable">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="equipmentNotes">Equipment Notes</label>
            <textarea
              id="equipmentNotes"
              {...register('equipmentNotes')}
              placeholder="Additional notes about equipment condition or issues"
              rows="3"
            />
          </div>
        </section>

        {/* Email Preview */}
        <section className="form-section email-preview">
          <h2>Email Preview</h2>
          <div className="email-content">
            <div className="email-subject">
              <strong>Subject:</strong> {generateEmailSubject()}
            </div>
            <div className="email-body">
              <pre>{generateEmailBody(watchedData)}</pre>
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="copy-button"
            >
              Copy Email Content
            </button>
          </div>
        </section>

        {/* Submit Section */}
        <section className="form-section submit-section">
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit HSO Checklist'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default HsoChecklistForm;
