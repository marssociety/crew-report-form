import React, { useState, useEffect, useCallback } from 'react';
import './CrewReportView.css';

const CrewReportView = ({ reportId, onBack }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/${reportId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <em className="empty-value">Not provided</em>;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <em className="empty-value">None</em>;
      }
      return (
        <ul className="array-list">
          {value.map((item, idx) => (
            <li key={idx}>{typeof item === 'object' ? renderObject(item) : item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      return renderObject(value);
    }
    // Format dates
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
      return new Date(value).toLocaleString();
    }
    return value;
  };

  const renderObject = (obj) => {
    return (
      <table className="nested-table">
        <tbody>
          {Object.entries(obj).map(([key, value]) => (
            <tr key={key}>
              <td className="field-name">{key}</td>
              <td className="field-value">{renderValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="crew-report-view">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crew-report-view">
        <div className="error-message">Error: {error}</div>
        <button onClick={onBack} className="back-button">
          Back to Reports List
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="crew-report-view">
        <div className="error-message">Report not found</div>
        <button onClick={onBack} className="back-button">
          Back to Reports List
        </button>
      </div>
    );
  }

  return (
    <div className="crew-report-view">
      <div className="report-header">
        <h1>{report.title}</h1>
        <button onClick={onBack} className="back-button">
          Back to Reports List
        </button>
      </div>

      <div className="report-content">
        <section className="report-section">
          <h2>Basic Information</h2>
          <table className="report-table">
            <tbody>
              <tr>
                <td className="field-name">report_id</td>
                <td className="field-value">{renderValue(report.report_id)}</td>
              </tr>
              <tr>
                <td className="field-name">title</td>
                <td className="field-value">{renderValue(report.title)}</td>
              </tr>
              <tr>
                <td className="field-name">author</td>
                <td className="field-value">{renderValue(report.author)}</td>
              </tr>
              <tr>
                <td className="field-name">station</td>
                <td className="field-value">{renderValue(report.station)}</td>
              </tr>
              <tr>
                <td className="field-name">mission_name</td>
                <td className="field-value">{renderValue(report.mission_name)}</td>
              </tr>
              <tr>
                <td className="field-name">crew_number</td>
                <td className="field-value">{renderValue(report.crew_number)}</td>
              </tr>
              <tr>
                <td className="field-name">mission_type</td>
                <td className="field-value">{renderValue(report.mission_type)}</td>
              </tr>
              <tr>
                <td className="field-name">mission_start_date</td>
                <td className="field-value">{renderValue(report.mission_start_date)}</td>
              </tr>
              <tr>
                <td className="field-name">mission_duration_day</td>
                <td className="field-value">{renderValue(report.mission_duration_day)}</td>
              </tr>
              <tr>
                <td className="field-name">report_date</td>
                <td className="field-value">{renderValue(report.report_date)}</td>
              </tr>
              <tr>
                <td className="field-name">report_type</td>
                <td className="field-value">{renderValue(report.report_type)}</td>
              </tr>
              <tr>
                <td className="field-name">publish_date</td>
                <td className="field-value">{renderValue(report.publish_date)}</td>
              </tr>
              <tr>
                <td className="field-name">content</td>
                <td className="field-value content-text">{renderValue(report.content)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {report.eva_data && (
          <section className="report-section">
            <h2>EVA Data</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="field-name">eva_number</td>
                  <td className="field-value">{renderValue(report.eva_data.eva_number)}</td>
                </tr>
                <tr>
                  <td className="field-name">duration_minutes</td>
                  <td className="field-value">{renderValue(report.eva_data.duration_minutes)}</td>
                </tr>
                <tr>
                  <td className="field-name">participants</td>
                  <td className="field-value">{renderValue(report.eva_data.participants)}</td>
                </tr>
                <tr>
                  <td className="field-name">objectives</td>
                  <td className="field-value">{renderValue(report.eva_data.objectives)}</td>
                </tr>
                <tr>
                  <td className="field-name">safety_notes</td>
                  <td className="field-value">{renderValue(report.eva_data.safety_notes)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {report.crew_members && report.crew_members.length > 0 && (
          <section className="report-section">
            <h2>Crew Members</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="field-name">crew_members</td>
                  <td className="field-value">{renderValue(report.crew_members)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {report.resources && (
          <section className="report-section">
            <h2>Resources</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="field-name">water_usage_liters</td>
                  <td className="field-value">{renderValue(report.resources.water_usage_liters)}</td>
                </tr>
                <tr>
                  <td className="field-name">power_usage_kwh</td>
                  <td className="field-value">{renderValue(report.resources.power_usage_kwh)}</td>
                </tr>
                <tr>
                  <td className="field-name">food_consumption</td>
                  <td className="field-value">{renderValue(report.resources.food_consumption)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {report.environmental_data && (
          <section className="report-section">
            <h2>Environmental Data</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="field-name">temperature_celsius</td>
                  <td className="field-value">{renderValue(report.environmental_data.temperature_celsius)}</td>
                </tr>
                <tr>
                  <td className="field-name">humidity_percent</td>
                  <td className="field-value">{renderValue(report.environmental_data.humidity_percent)}</td>
                </tr>
                <tr>
                  <td className="field-name">pressure_kpa</td>
                  <td className="field-value">{renderValue(report.environmental_data.pressure_kpa)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {report.incidents && report.incidents.length > 0 && (
          <section className="report-section">
            <h2>Incidents</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="field-name">incidents</td>
                  <td className="field-value">{renderValue(report.incidents)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
};

export default CrewReportView;
