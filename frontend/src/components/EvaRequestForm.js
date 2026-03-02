import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import './EvaRequestForm.css';

const EvaRequestForm = () => {
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
      requestDate: new Date().toISOString().split('T')[0],
      requestedEvaDate: '',
      requestedStartTime: '',
      requestedEndTime: '',
      weatherSupportsEva: '',
      purposeOfEva: '',
      destination: '',
      coordinates: '',
      participants: '',
      routes: '',
      modeOfTravel: '',
      vehicles: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} EVA Request ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    return `Report title: EVA Request
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

EVA #: ${data.evaNumber}
Today's Date: ${formatDate(data.requestDate)}
Requested EVA Date: ${formatDate(data.requestedEvaDate)}
Requested Start Time: ${data.requestedStartTime}
Requested End Time: ${data.requestedEndTime}
Weather supports EVA: ${data.weatherSupportsEva}

Purpose of EVA: ${data.purposeOfEva}

Destination: ${data.destination}
Coordinates (UTM WGS 84): ${data.coordinates}
Participants: ${data.participants}
Route(s): ${data.routes}
Mode of travel: ${data.modeOfTravel}
Vehicles: ${data.vehicles}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = {
        ...data,
        reportDate: data.date,
        reportType: 'eva-request',
        emailSubject: generateEmailSubject(),
        emailBody: generateEmailBody(data),
        submittedAt: new Date().toISOString()
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/eva-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'EVA request submitted successfully!' });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ type: 'error', message: errorData.message || 'Failed to submit EVA request' });
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
    <div className="eva-request-form-container">
      <div className="form-header">
        <h1>EVA Request Form</h1>
        <p>Mars Society Analog Research Station - EVA Request</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="eva-request-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* EVA Request Details */}
        <section className="form-section">
          <h2>EVA Request Details</h2>

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
              <label htmlFor="requestDate">Today's Date</label>
              <input
                type="date"
                id="requestDate"
                {...register('requestDate')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestedEvaDate">Requested EVA Date *</label>
              <input
                type="date"
                id="requestedEvaDate"
                {...register('requestedEvaDate', { required: 'Requested EVA date is required' })}
              />
              {errors.requestedEvaDate && <span className="error">{errors.requestedEvaDate.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requestedStartTime">Requested Start Time</label>
              <input
                type="time"
                id="requestedStartTime"
                {...register('requestedStartTime')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestedEndTime">Requested End Time</label>
              <input
                type="time"
                id="requestedEndTime"
                {...register('requestedEndTime')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="weatherSupportsEva">Weather Supports EVA</label>
            <input
              type="text"
              id="weatherSupportsEva"
              {...register('weatherSupportsEva')}
              placeholder="Yes/No with explanation"
            />
          </div>
        </section>

        {/* Purpose */}
        <section className="form-section">
          <h2>Purpose</h2>

          <div className="form-group">
            <label htmlFor="purposeOfEva">Purpose of EVA *</label>
            <textarea
              id="purposeOfEva"
              {...register('purposeOfEva', { required: 'Purpose of EVA is required' })}
              placeholder="Clearly identify why you are going on this EVA, what you plan to do, and what you expect to achieve. Include any research objectives, equipment to be tested, or areas to be explored."
              rows="6"
            />
            {errors.purposeOfEva && <span className="error">{errors.purposeOfEva.message}</span>}
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

          <div className="form-group">
            <label htmlFor="coordinates">Coordinates (UTM WGS 84)</label>
            <input
              type="text"
              id="coordinates"
              {...register('coordinates')}
              placeholder="e.g., 12S 518500E 4250000N"
            />
          </div>

          <div className="form-group">
            <label htmlFor="routes">Route(s)</label>
            <textarea
              id="routes"
              {...register('routes')}
              placeholder="Describe the planned route(s) for the EVA"
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

          <div className="form-group">
            <label htmlFor="vehicles">Vehicles</label>
            <input
              type="text"
              id="vehicles"
              {...register('vehicles')}
              placeholder="Spirit, Perseverance, Opportunity, Curiosity"
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
              placeholder="List all planned EVA participants and their roles"
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
            {isSubmitting ? 'Submitting...' : 'Submit EVA Request'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default EvaRequestForm;
