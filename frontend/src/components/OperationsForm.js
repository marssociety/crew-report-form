import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import RoverBlock from './RoverBlock';
import { buildTemplatePayload } from '../utils/templatePayload';
import './OperationsForm.css';

const OperationsForm = () => {
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
      nonNominalSystems: '',
      notesOnNonNominal: '',
      rovers: [
        { roverName: 'Spirit', roverUsed: '', hours: '', beginningCharge: '', endingCharge: '', currentlyCharging: '' },
        { roverName: 'Opportunity', roverUsed: '', hours: '', beginningCharge: '', endingCharge: '', currentlyCharging: '' },
        { roverName: 'Curiosity', roverUsed: '', hours: '', beginningCharge: '', endingCharge: '', currentlyCharging: '' },
        { roverName: 'Perseverance', roverUsed: '', hours: '', beginningCharge: '', endingCharge: '', currentlyCharging: '' },
      ],
      generalNotesOnRovers: '',
      summaryOfHabOperations: '',
      waterUse: '',
      mainTankLevel: '',
      mainWaterTankPipeHeater: '',
      mainWaterTankHeater: '',
      toiletTankEmptied: '',
      summaryOfInternet: '',
      summaryOfSuitsAndRadios: '',
      summaryOfGreenhab: '',
      greenhabWaterUseGallons: '',
      greenhabHeater: '',
      greenhabSupplementalLight: '',
      greenhabHarvest: '',
      summaryOfSciencedome: '',
      dualSplit: '',
      summaryOfRam: '',
      summaryOfObservatory: '',
      summaryOfHealthSafety: '',
      questionsToMissionSupport: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date ?
      new Date(watchedData.date).toLocaleDateString('en-GB') :
      'dd-MM-yyyy';
    return `Crew ${crewNum} Operations Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    const roverLines = (data.rovers || []).map((rover) => {
      return `  ${rover.roverName}:
    Used: ${rover.roverUsed}
    Hours: ${rover.hours}
    Beginning Charge: ${rover.beginningCharge}
    Ending Charge: ${rover.endingCharge}
    Currently Charging: ${rover.currentlyCharging}`;
    }).join('\n');

    return `Report title: Operations Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

Non-Nominal Systems: ${data.nonNominalSystems}
Notes on Non-Nominal Systems: ${data.notesOnNonNominal}

Rovers:
${roverLines}
General Notes on Rovers: ${data.generalNotesOnRovers}

Hab Operations:
Summary of Hab Operations: ${data.summaryOfHabOperations}
Water Use: ${data.waterUse}
Main Tank Level: ${data.mainTankLevel}
Main Water Tank Pipe Heater: ${data.mainWaterTankPipeHeater}
Main Water Tank Heater: ${data.mainWaterTankHeater}
Toilet Tank Emptied: ${data.toiletTankEmptied}

Communications:
Summary of Internet: ${data.summaryOfInternet}
Summary of Suits and Radios: ${data.summaryOfSuitsAndRadios}

GreenHab Operations:
Summary of GreenHab: ${data.summaryOfGreenhab}
GreenHab Water Use (gallons): ${data.greenhabWaterUseGallons}
GreenHab Heater: ${data.greenhabHeater}
GreenHab Supplemental Light: ${data.greenhabSupplementalLight}
GreenHab Harvest: ${data.greenhabHarvest}

Facility Summaries:
Summary of Science Dome: ${data.summaryOfSciencedome}
Dual Split: ${data.dualSplit}
Summary of RAM: ${data.summaryOfRam}
Summary of Observatory: ${data.summaryOfObservatory}
Summary of Health & Safety: ${data.summaryOfHealthSafety}
Questions to Mission Support: ${data.questionsToMissionSupport}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = buildTemplatePayload(
        data, 'operations_report',
        generateEmailSubject(),
        generateEmailBody(data)
      );

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Operations report submitted successfully!' });
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
    <div className="operations-form-container">
      <div className="form-header">
        <h1>Operations Report Form</h1>
        <p>Mars Society Analog Research Station - Operations Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="operations-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* Non-Nominal Systems */}
        <section className="form-section">
          <h2>Non-Nominal Systems</h2>

          <div className="form-group">
            <label htmlFor="nonNominalSystems">Non-Nominal Systems</label>
            <textarea
              id="nonNominalSystems"
              {...register('nonNominalSystems')}
              placeholder="List any systems that are not operating nominally"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notesOnNonNominal">Notes on Non-Nominal Systems</label>
            <textarea
              id="notesOnNonNominal"
              {...register('notesOnNonNominal')}
              placeholder="Additional details on non-nominal system issues"
              rows="3"
            />
          </div>
        </section>

        {/* Rovers */}
        <section className="form-section">
          <h2>Rovers</h2>

          {watchedData.rovers && watchedData.rovers.map((rover, index) => (
            <RoverBlock
              key={index}
              index={index}
              roverName={rover.roverName || ['Spirit', 'Opportunity', 'Curiosity', 'Perseverance'][index]}
              register={register}
            />
          ))}

          <div className="form-group">
            <label htmlFor="generalNotesOnRovers">General Notes on Rovers</label>
            <textarea
              id="generalNotesOnRovers"
              {...register('generalNotesOnRovers')}
              placeholder="General notes about rover operations"
              rows="3"
            />
          </div>
        </section>

        {/* Hab Operations */}
        <section className="form-section">
          <h2>Hab Operations</h2>

          <div className="form-group">
            <label htmlFor="summaryOfHabOperations">Summary of Hab Operations</label>
            <textarea
              id="summaryOfHabOperations"
              {...register('summaryOfHabOperations')}
              placeholder="Summary of habitat operations for this sol"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="waterUse">Water Use</label>
              <input
                type="text"
                id="waterUse"
                {...register('waterUse')}
                placeholder="e.g., 15 gallons"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mainTankLevel">Main Tank Level</label>
              <input
                type="text"
                id="mainTankLevel"
                {...register('mainTankLevel')}
                placeholder="Remaining gallons"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mainWaterTankPipeHeater">Main Water Tank Pipe Heater</label>
              <select
                id="mainWaterTankPipeHeater"
                {...register('mainWaterTankPipeHeater')}
              >
                <option value="">Select</option>
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mainWaterTankHeater">Main Water Tank Heater</label>
              <select
                id="mainWaterTankHeater"
                {...register('mainWaterTankHeater')}
              >
                <option value="">Select</option>
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="toiletTankEmptied">Toilet Tank Emptied</label>
              <select
                id="toiletTankEmptied"
                {...register('toiletTankEmptied')}
              >
                <option value="">Select</option>
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>
          </div>
        </section>

        {/* Communications */}
        <section className="form-section">
          <h2>Communications</h2>

          <div className="form-group">
            <label htmlFor="summaryOfInternet">Summary of Internet</label>
            <textarea
              id="summaryOfInternet"
              {...register('summaryOfInternet')}
              placeholder="Status and notes on internet connectivity"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summaryOfSuitsAndRadios">Summary of Suits and Radios</label>
            <textarea
              id="summaryOfSuitsAndRadios"
              {...register('summaryOfSuitsAndRadios')}
              placeholder="Status and notes on EVA suits and radio equipment"
              rows="3"
            />
          </div>
        </section>

        {/* GreenHab Operations */}
        <section className="form-section">
          <h2>GreenHab Operations</h2>

          <div className="form-group">
            <label htmlFor="summaryOfGreenhab">Summary of GreenHab</label>
            <textarea
              id="summaryOfGreenhab"
              {...register('summaryOfGreenhab')}
              placeholder="Summary of GreenHab operations for this sol"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="greenhabWaterUseGallons">GreenHab Water Use (gallons)</label>
              <input
                type="number"
                step="0.1"
                id="greenhabWaterUseGallons"
                {...register('greenhabWaterUseGallons')}
                placeholder="Gallons used"
              />
            </div>

            <div className="form-group">
              <label htmlFor="greenhabHeater">GreenHab Heater</label>
              <select
                id="greenhabHeater"
                {...register('greenhabHeater')}
              >
                <option value="">Select</option>
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="greenhabSupplementalLight">GreenHab Supplemental Light</label>
              <input
                type="text"
                id="greenhabSupplementalLight"
                {...register('greenhabSupplementalLight')}
                placeholder="Hours or Disabled"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="greenhabHarvest">GreenHab Harvest</label>
            <textarea
              id="greenhabHarvest"
              {...register('greenhabHarvest')}
              placeholder="Details of any harvest"
              rows="2"
            />
          </div>
        </section>

        {/* Facility Summaries */}
        <section className="form-section">
          <h2>Facility Summaries</h2>

          <div className="form-group">
            <label htmlFor="summaryOfSciencedome">Summary of Science Dome</label>
            <textarea
              id="summaryOfSciencedome"
              {...register('summaryOfSciencedome')}
              placeholder="Status and operations of the Science Dome"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dualSplit">Dual Split</label>
            <input
              type="text"
              id="dualSplit"
              {...register('dualSplit')}
              placeholder="Heat/AC, On/Off/Auto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summaryOfRam">Summary of RAM</label>
            <textarea
              id="summaryOfRam"
              {...register('summaryOfRam')}
              placeholder="Status and operations of the RAM module"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summaryOfObservatory">Summary of Observatory</label>
            <textarea
              id="summaryOfObservatory"
              {...register('summaryOfObservatory')}
              placeholder="Status and operations of the Observatory"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summaryOfHealthSafety">Summary of Health & Safety</label>
            <textarea
              id="summaryOfHealthSafety"
              {...register('summaryOfHealthSafety')}
              placeholder="Health and safety notes for this sol"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="questionsToMissionSupport">Questions to Mission Support</label>
            <textarea
              id="questionsToMissionSupport"
              {...register('questionsToMissionSupport')}
              placeholder="Any questions or requests for Mission Support"
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
            {isSubmitting ? 'Submitting...' : 'Submit Operations Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default OperationsForm;
