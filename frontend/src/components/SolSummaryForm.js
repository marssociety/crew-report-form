import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import './SolSummaryForm.css';

const SolSummaryForm = () => {
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
      summaryTitle: '',
      missionStatus: '',
      solActivitySummary: '',
      lookAheadPlan: '',
      anomalies: '',
      weather: '',
      crewPhysicalStatus: '',
      eva: '',
      reportsToBeFiled: '',
      supportRequested: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date ?
      new Date(watchedData.date).toLocaleDateString('en-GB') :
      'dd-MM-yyyy';
    return `Crew ${crewNum} Sol Summary Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    return `Report title: Sol Summary Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

Summary Title: ${data.summaryTitle}
Mission Status: ${data.missionStatus}
Sol Activity Summary: ${data.solActivitySummary}
Look Ahead Plan: ${data.lookAheadPlan}
Anomalies in work: ${data.anomalies}
Weather: ${data.weather}
Crew Physical Status: ${data.crewPhysicalStatus}
EVA: ${data.eva}
Reports to be filed: ${data.reportsToBeFiled}
Support Requested: ${data.supportRequested}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = {
        ...data,
        reportDate: data.date,
        reportType: 'sol-summary',
        emailSubject: generateEmailSubject(),
        emailBody: generateEmailBody(data),
        submittedAt: new Date().toISOString()
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/sol-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Sol Summary report submitted successfully!' });
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
    <div className="sol-summary-form-container">
      <div className="form-header">
        <h1>Sol Summary Report Form</h1>
        <p>Mars Society Analog Research Station - Sol Summary Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="sol-summary-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* Sol Summary */}
        <section className="form-section">
          <h2>Sol Summary</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="summaryTitle">Summary Title</label>
              <input
                type="text"
                id="summaryTitle"
                {...register('summaryTitle')}
                placeholder="Title for this sol's summary"
              />
            </div>

            <div className="form-group">
              <label htmlFor="missionStatus">Mission Status</label>
              <input
                type="text"
                id="missionStatus"
                {...register('missionStatus')}
                placeholder="e.g., Nominal, In Progress"
              />
            </div>
          </div>
        </section>

        {/* Activity & Plans */}
        <section className="form-section">
          <h2>Activity & Plans</h2>

          <div className="form-group">
            <label htmlFor="solActivitySummary">Sol Activity Summary</label>
            <textarea
              id="solActivitySummary"
              {...register('solActivitySummary')}
              placeholder="Detailed summary of activities performed during this sol"
              rows="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lookAheadPlan">Look Ahead Plan</label>
            <textarea
              id="lookAheadPlan"
              {...register('lookAheadPlan')}
              placeholder="Plans and objectives for upcoming sols"
              rows="4"
            />
          </div>
        </section>

        {/* Status & Observations */}
        <section className="form-section">
          <h2>Status & Observations</h2>

          <div className="form-group">
            <label htmlFor="anomalies">Anomalies in Work</label>
            <textarea
              id="anomalies"
              {...register('anomalies')}
              placeholder="Any anomalies or unexpected issues encountered"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weather">Weather</label>
            <textarea
              id="weather"
              {...register('weather')}
              placeholder="Weather conditions and observations"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="crewPhysicalStatus">Crew Physical Status</label>
            <textarea
              id="crewPhysicalStatus"
              {...register('crewPhysicalStatus')}
              placeholder="Physical health and status of crew members"
              rows="3"
            />
          </div>
        </section>

        {/* Additional Information */}
        <section className="form-section">
          <h2>Additional Information</h2>

          <div className="form-group">
            <label htmlFor="eva">EVA</label>
            <textarea
              id="eva"
              {...register('eva')}
              placeholder="EVA activities and notes"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reportsToBeFiled">Reports to be Filed</label>
            <textarea
              id="reportsToBeFiled"
              {...register('reportsToBeFiled')}
              placeholder="List of reports that need to be filed"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="supportRequested">Support Requested</label>
            <textarea
              id="supportRequested"
              {...register('supportRequested')}
              placeholder="Any support or assistance needed from Mission Support"
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
            {isSubmitting ? 'Submitting...' : 'Submit Sol Summary Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default SolSummaryForm;
