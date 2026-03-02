import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import './JournalistForm.css';

const JournalistForm = () => {
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
      journalistReportTitle: '',
      reportBody: ''
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} Journalist Report ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    return `Report title: Journalist Report
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}
${data.journalistReportTitle ? `\nTitle: ${data.journalistReportTitle}` : ''}

${data.reportBody}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = {
        ...data,
        reportDate: data.date,
        reportType: 'journalist',
        emailSubject: generateEmailSubject(),
        emailBody: generateEmailBody(data),
        submittedAt: new Date().toISOString()
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/journalist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Journalist report submitted successfully!' });
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
    <div className="journalist-form-container">
      <div className="form-header">
        <h1>Journalist Report Form</h1>
        <p>Mars Society Analog Research Station - Journalist Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="journalist-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* Journalist Report */}
        <section className="form-section">
          <h2>Journalist Report</h2>

          <div className="form-group">
            <label htmlFor="journalistReportTitle">Journalist Report Title (if applicable)</label>
            <input
              type="text"
              id="journalistReportTitle"
              {...register('journalistReportTitle')}
              placeholder="Optional title for your report"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reportBody">Report Body *</label>
            <textarea
              id="reportBody"
              {...register('reportBody', { required: 'Report body is required' })}
              placeholder="Write your journalist report here..."
              rows="15"
            />
            {errors.reportBody && <span className="error">{errors.reportBody.message}</span>}
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
            {isSubmitting ? 'Submitting...' : 'Submit Journalist Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default JournalistForm;
