import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import './GreenHabReport.css';

const GreenHabReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      crewNumber: '',
      position: '',
      reportPreparedBy: '',
      date: new Date().toISOString().split('T')[0],
      sol: '',
      environmentalControl: '',
      avgTemperature: '',
      maxTemperature: '',
      minTemperature: '',
      supplementalLightHours: '',
      dailyWaterUsageCrops: '',
      dailyWaterUsageOther: '',
      blueTankRemaining: '',
      wateringTimes: [''],
      cropsChanges: '',
      narrative: '',
      harvests: [{ crop: '', mass: '' }],
      supportNeeded: '',
      attachedPictures: false
    }
  });

  const { fields: wateringFields, append: appendWatering, remove: removeWatering } = useFieldArray({
    control,
    name: 'wateringTimes'
  });

  const { fields: harvestFields, append: appendHarvest, remove: removeHarvest } = useFieldArray({
    control,
    name: 'harvests'
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date ? 
      new Date(watchedData.date).toLocaleDateString('en-GB') : 
      'dd-MM-yyyy';
    return `Crew ${crewNum} GreenHab Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    const wateringTimes = data.wateringTimes.filter(time => time.trim()).join(', ');
    const harvestList = data.harvests
      .filter(h => h.crop || h.mass)
      .map(h => `${h.crop}: ${h.mass}g`)
      .join(', ');

    return `Report title: GreenHab Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

Environmental control (fan & heater): ${data.environmentalControl}
Average temperatures (last 24h): ${data.avgTemperature}
Maximum temperature (last 24h): ${data.maxTemperature}
Minimum temperature (last 24h): ${data.minTemperature}
Hours of supplemental light: ${data.supplementalLightHours}
Daily water usage for crops: ${data.dailyWaterUsageCrops}
Daily water usage for research and/or other purposes: ${data.dailyWaterUsageOther}
Water in Blue Tank (200 gallon capacity): ${data.blueTankRemaining} gallons remaining
Time(s) of watering for crops: ${wateringTimes}
Changes to crops: ${data.cropsChanges}
Narrative: ${data.narrative}
Harvest: ${harvestList}
Support/supplies needed: ${data.supportNeeded}

${data.attachedPictures ? 'Attached pictures included.' : ''}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = {
        ...data,
        reportDate: data.date, // Map 'date' to 'reportDate' for backend compatibility
        reportType: 'greenhab',
        emailSubject: generateEmailSubject(),
        emailBody: generateEmailBody(data),
        submittedAt: new Date().toISOString()
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/greenhab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'GreenHab report submitted successfully!' });
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
    <div className="greenhab-form-container">
      <div className="form-header">
        <h1>GreenHab Report Form</h1>
        <p>Mars Society Analog Research Station - GreenHab Operations Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="greenhab-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Report Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="crewNumber">Crew Number *</label>
              <input
                type="text"
                id="crewNumber"
                {...register('crewNumber', { required: 'Crew number is required' })}
                placeholder="e.g., 271"
              />
              {errors.crewNumber && <span className="error">{errors.crewNumber.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <select
                id="position"
                {...register('position', { required: 'Position is required' })}
              >
                <option value="">Select Position</option>
                <option value="Commander">Commander</option>
                <option value="Executive Officer">Executive Officer</option>
                <option value="Engineer">Engineer</option>
                <option value="Biologist">Biologist</option>
                <option value="Geologist">Geologist</option>
                <option value="GreenHab Officer">GreenHab Officer</option>
                <option value="Health & Safety Officer">Health & Safety Officer</option>
                <option value="Journalist">Journalist</option>
              </select>
              {errors.position && <span className="error">{errors.position.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reportPreparedBy">Report Prepared By *</label>
              <input
                type="text"
                id="reportPreparedBy"
                {...register('reportPreparedBy', { required: 'Full name is required' })}
                placeholder="Your full legal name"
              />
              {errors.reportPreparedBy && <span className="error">{errors.reportPreparedBy.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && <span className="error">{errors.date.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sol">Sol *</label>
              <input
                type="number"
                id="sol"
                {...register('sol', { required: 'Sol is required', min: 1 })}
                placeholder="Mission day"
              />
              {errors.sol && <span className="error">{errors.sol.message}</span>}
            </div>
          </div>
        </section>

        {/* Environmental Data */}
        <section className="form-section">
          <h2>Environmental Control & Temperature</h2>
          
          <div className="form-group">
            <label htmlFor="environmentalControl">Environmental Control (fan & heater) *</label>
            <textarea
              id="environmentalControl"
              {...register('environmentalControl', { required: 'Environmental control status is required' })}
              placeholder="Status of fans and heaters. If unsure, contact Mission Support."
              rows="2"
            />
            {errors.environmentalControl && <span className="error">{errors.environmentalControl.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="avgTemperature">Average Temperature (last 24h) *</label>
              <input
                type="text"
                id="avgTemperature"
                {...register('avgTemperature', { required: 'Average temperature is required' })}
                placeholder="e.g., 22°C or 72°F"
              />
              {errors.avgTemperature && <span className="error">{errors.avgTemperature.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="maxTemperature">Maximum Temperature (last 24h) *</label>
              <input
                type="text"
                id="maxTemperature"
                {...register('maxTemperature', { required: 'Maximum temperature is required' })}
                placeholder="e.g., 28°C or 82°F"
              />
              {errors.maxTemperature && <span className="error">{errors.maxTemperature.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="minTemperature">Minimum Temperature (last 24h) *</label>
              <input
                type="text"
                id="minTemperature"
                {...register('minTemperature', { required: 'Minimum temperature is required' })}
                placeholder="e.g., 18°C or 64°F"
              />
              {errors.minTemperature && <span className="error">{errors.minTemperature.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="supplementalLightHours">Hours of Supplemental Light *</label>
            <input
              type="number"
              step="0.1"
              id="supplementalLightHours"
              {...register('supplementalLightHours', { required: 'Supplemental light hours is required', min: 0 })}
              placeholder="Hours of artificial lighting"
            />
            {errors.supplementalLightHours && <span className="error">{errors.supplementalLightHours.message}</span>}
          </div>
        </section>

        {/* Water Usage */}
        <section className="form-section">
          <h2>Water Usage</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dailyWaterUsageCrops">Daily Water Usage for Crops *</label>
              <input
                type="text"
                id="dailyWaterUsageCrops"
                {...register('dailyWaterUsageCrops', { required: 'Daily water usage for crops is required' })}
                placeholder="e.g., 15 liters or 4 gallons"
              />
              {errors.dailyWaterUsageCrops && <span className="error">{errors.dailyWaterUsageCrops.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dailyWaterUsageOther">Daily Water Usage for Research/Other</label>
              <input
                type="text"
                id="dailyWaterUsageOther"
                {...register('dailyWaterUsageOther')}
                placeholder="e.g., 5 liters or 1.3 gallons"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="blueTankRemaining">Water in Blue Tank (200 gallon capacity) *</label>
            <input
              type="number"
              step="0.1"
              id="blueTankRemaining"
              {...register('blueTankRemaining', { required: 'Blue tank water level is required', min: 0, max: 200 })}
              placeholder="Gallons remaining"
            />
            {errors.blueTankRemaining && <span className="error">{errors.blueTankRemaining.message}</span>}
          </div>
        </section>

        {/* Watering Times */}
        <section className="form-section">
          <h2>Watering Schedule</h2>
          
          <div className="dynamic-section">
            <div className="section-header">
              <h3>Time(s) of Watering for Crops</h3>
              <button
                type="button"
                onClick={() => appendWatering('')}
                className="add-button"
              >
                Add Watering Time
              </button>
            </div>

            {wateringFields.map((field, index) => (
              <div key={field.id} className="dynamic-item">
                <div className="form-group">
                  <label htmlFor={`wateringTimes.${index}`}>Watering Time {index + 1}</label>
                  <input
                    type="time"
                    {...register(`wateringTimes.${index}`)}
                    placeholder="e.g., 08:00"
                  />
                </div>
                {wateringFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWatering(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Crops and Harvest */}
        <section className="form-section">
          <h2>Crops & Harvest</h2>
          
          <div className="form-group">
            <label htmlFor="cropsChanges">Changes to Crops</label>
            <textarea
              id="cropsChanges"
              {...register('cropsChanges')}
              placeholder="Describe any changes, additions, or issues with crops"
              rows="3"
            />
          </div>

          <div className="dynamic-section">
            <div className="section-header">
              <h3>Harvest Data</h3>
              <button
                type="button"
                onClick={() => appendHarvest({ crop: '', mass: '' })}
                className="add-button"
              >
                Add Harvest
              </button>
            </div>

            {harvestFields.map((field, index) => (
              <div key={field.id} className="dynamic-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`harvests.${index}.crop`}>Crop Type</label>
                    <input
                      type="text"
                      {...register(`harvests.${index}.crop`)}
                      placeholder="e.g., Tomatoes, Lettuce, Radishes"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`harvests.${index}.mass`}>Mass (grams)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`harvests.${index}.mass`)}
                      placeholder="Weight in grams"
                    />
                  </div>
                </div>
                {harvestFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHarvest(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Narrative and Support */}
        <section className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="narrative">Narrative *</label>
            <textarea
              id="narrative"
              {...register('narrative', { required: 'Narrative is required' })}
              placeholder="Detailed description of GreenHab activities, observations, and any notable events"
              rows="5"
            />
            {errors.narrative && <span className="error">{errors.narrative.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="supportNeeded">Support/Supplies Needed</label>
            <textarea
              id="supportNeeded"
              {...register('supportNeeded')}
              placeholder="List any supplies, equipment, or support needed for GreenHab operations"
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                {...register('attachedPictures')}
              />
              Attached pictures included
            </label>
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
            {isSubmitting ? 'Submitting...' : 'Submit GreenHab Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default GreenHabReportForm;