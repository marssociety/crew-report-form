import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import { buildTemplatePayload } from '../utils/templatePayload';
import './EvaReportForm.css';

const EvaReportForm = () => {
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
      evaNumber: '',
      purposeOfEva: '',
      startTime: '',
      endTime: '',
      narrative: '',
      destination: '',
      coordEasting: '',
      coordNorthing: '',
      participants: '',
      routes: '',
      modeOfTravel: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} EVA Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    return `Report title: EVA Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

EVA #: ${data.evaNumber}
Purpose of EVA: ${data.purposeOfEva}
Start time: ${data.startTime}
End time: ${data.endTime}

Narrative: ${data.narrative}

Destination: ${data.destination}
Coordinates (UTM WGS 84): Easting ${data.coordEasting}, Northing ${data.coordNorthing}
Participants: ${data.participants}
Route(s): ${data.routes}
Mode of travel: ${data.modeOfTravel}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = buildTemplatePayload(
        data, 'eva_report',
        generateEmailSubject(),
        generateEmailBody(data)
      );

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/eva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'EVA report submitted successfully!' });
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
    <div className="eva-report-form-container">
      <div className="form-header">
        <h1>EVA Report Form</h1>
        <p>Mars Society Analog Research Station - EVA Operations Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="eva-report-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* EVA Details */}
        <section className="form-section">
          <h2>EVA Details</h2>

          <div className="form-group">
            <label htmlFor="evaNumber">EVA Number *</label>
            <input
              type="number"
              id="evaNumber"
              {...register('evaNumber', { required: 'EVA number is required' })}
              placeholder="e.g., 1"
            />
            {errors.evaNumber && <span className="error">{errors.evaNumber.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                {...register('startTime')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                {...register('endTime')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purposeOfEva">Purpose of EVA *</label>
            <textarea
              id="purposeOfEva"
              {...register('purposeOfEva', { required: 'Purpose of EVA is required' })}
              placeholder="Describe the purpose and objectives of this EVA"
              rows="4"
            />
            {errors.purposeOfEva && <span className="error">{errors.purposeOfEva.message}</span>}
          </div>
        </section>

        {/* Narrative */}
        <section className="form-section">
          <h2>Narrative</h2>

          <div className="form-group">
            <label htmlFor="narrative">EVA Narrative *</label>
            <textarea
              id="narrative"
              {...register('narrative', { required: 'Narrative is required' })}
              placeholder="Detailed narrative of the EVA, including observations and activities"
              rows="6"
            />
            {errors.narrative && <span className="error">{errors.narrative.message}</span>}
          </div>
        </section>

        {/* Location & Route */}
        <section className="form-section">
          <h2>Location & Route</h2>

          <div className="form-group">
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              {...register('destination')}
              placeholder="e.g., Marble Ritual, Kissing Camel Ridge"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="coordEasting">Easting (UTM WGS 84)</label>
              <input
                type="text"
                id="coordEasting"
                {...register('coordEasting')}
                placeholder="e.g., 518500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="coordNorthing">Northing (UTM WGS 84)</label>
              <input
                type="text"
                id="coordNorthing"
                {...register('coordNorthing')}
                placeholder="e.g., 4250000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="routes">Route(s)</label>
            <textarea
              id="routes"
              {...register('routes')}
              placeholder="Describe the route(s) taken during the EVA"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modeOfTravel">Mode of Travel</label>
            <input
              type="text"
              id="modeOfTravel"
              {...register('modeOfTravel')}
              placeholder="e.g., Walking, Rover"
            />
          </div>
        </section>

        {/* Participants */}
        <section className="form-section">
          <h2>Participants</h2>

          <div className="form-group">
            <label htmlFor="participants">EVA Participants</label>
            <textarea
              id="participants"
              {...register('participants')}
              placeholder="List all EVA participants and their roles"
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
            {isSubmitting ? 'Submitting...' : 'Submit EVA Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default EvaReportForm;
