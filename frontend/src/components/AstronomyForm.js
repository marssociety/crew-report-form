import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import { buildTemplatePayload } from '../utils/templatePayload';
import './AstronomyForm.css';

const AstronomyForm = () => {
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
      roboticTelescopeRequested: '',
      objectsToBeImaged: '',
      roboticImagesSubmitted: '',
      roboticProblemsEncountered: '',
      solarFeaturesObserved: '',
      muskImagesSubmitted: '',
      muskProblemsEncountered: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} Astronomy Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    return `Report title: Astronomy Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

ROBOTIC OBSERVATORY
Telescope requested: ${data.roboticTelescopeRequested || 'N/A'}
Objects to be imaged: ${data.objectsToBeImaged || 'N/A'}
Images submitted: ${data.roboticImagesSubmitted || 'N/A'}
Problems encountered: ${data.roboticProblemsEncountered || 'N/A'}

MUSK OBSERVATORY
Solar features observed: ${data.solarFeaturesObserved || 'N/A'}
Images submitted: ${data.muskImagesSubmitted || 'N/A'}
Problems encountered: ${data.muskProblemsEncountered || 'N/A'}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = buildTemplatePayload(
        data, 'astronomy_report',
        generateEmailSubject(),
        generateEmailBody(data)
      );

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/astronomy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Astronomy report submitted successfully!' });
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
    <div className="astronomy-form-container">
      <div className="form-header">
        <h1>Astronomy Report Form</h1>
        <p>Mars Desert Research Station - Astronomy Operations Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="astronomy-form">
        <SharedHeader register={register} errors={errors} />

        {/* Robotic Observatory */}
        <section className="form-section">
          <h2>Robotic Observatory</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roboticTelescopeRequested">Telescope Requested</label>
              <select
                id="roboticTelescopeRequested"
                {...register('roboticTelescopeRequested')}
              >
                <option value="">Select Telescope</option>
                <option value="MDRS-14">MDRS-14</option>
                <option value="MDRS-WF">MDRS-WF</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="objectsToBeImaged">Objects to be Imaged</label>
            <textarea
              id="objectsToBeImaged"
              {...register('objectsToBeImaged')}
              placeholder="List celestial objects to be imaged"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roboticImagesSubmitted">Images Submitted</label>
              <input
                type="text"
                id="roboticImagesSubmitted"
                {...register('roboticImagesSubmitted')}
                placeholder="Number or description of images submitted"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roboticProblemsEncountered">Problems Encountered</label>
            <textarea
              id="roboticProblemsEncountered"
              {...register('roboticProblemsEncountered')}
              placeholder="Describe any problems encountered"
              rows="3"
            />
          </div>
        </section>

        {/* Musk Observatory */}
        <section className="form-section">
          <h2>Musk Observatory</h2>

          <div className="form-group">
            <label htmlFor="solarFeaturesObserved">Solar Features Observed</label>
            <textarea
              id="solarFeaturesObserved"
              {...register('solarFeaturesObserved')}
              placeholder="Describe solar features observed"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="muskImagesSubmitted">Images Submitted</label>
              <input
                type="text"
                id="muskImagesSubmitted"
                {...register('muskImagesSubmitted')}
                placeholder="Number or description of images submitted"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="muskProblemsEncountered">Problems Encountered</label>
            <textarea
              id="muskProblemsEncountered"
              {...register('muskProblemsEncountered')}
              placeholder="Describe any problems encountered"
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
            {isSubmitting ? 'Submitting...' : 'Submit Astronomy Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default AstronomyForm;
