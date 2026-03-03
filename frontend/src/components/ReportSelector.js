import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportSelector.css';

const ReportSelector = () => {
  const navigate = useNavigate();

  const dailyReports = [
    {
      id: 'sol-summary',
      name: 'Sol Summary',
      filedBy: 'Commander',
      frequency: 'Daily',
    },
    {
      id: 'operations',
      name: 'Operations Report',
      filedBy: 'Crew Engineer',
      frequency: 'Daily',
    },
    {
      id: 'greenhab',
      name: 'GreenHab Report',
      filedBy: 'GreenHab Officer',
      frequency: 'Daily',
    },
    {
      id: 'eva-report',
      name: 'EVA Report',
      filedBy: 'EVA Lead',
      frequency: 'After each EVA',
    },
    {
      id: 'eva-request',
      name: 'EVA Request',
      filedBy: 'EVA Lead',
      frequency: 'Before each EVA',
    },
    {
      id: 'journalist',
      name: 'Journalist Report',
      filedBy: 'Journalist',
      frequency: 'Daily',
    },
    {
      id: 'photos',
      name: 'Photos of the Day',
      filedBy: 'Journalist',
      frequency: 'Daily',
    },
    {
      id: 'astronomy',
      name: 'Astronomy Report',
      filedBy: 'Astronomy Officer',
      frequency: 'Daily',
    },
  ];

  const missionReports = [
    {
      id: 'hso-checklist',
      name: 'HSO Checklist',
      filedBy: 'HSO',
      frequency: 'Once per mission',
    },
    {
      id: 'checkout',
      name: 'Checkout Checklist',
      filedBy: 'Crew',
      frequency: 'End of mission',
    },
    {
      id: 'food-inventory',
      name: 'Food Inventory',
      filedBy: 'Ops / Commander',
      frequency: 'End of mission',
    },
  ];

  const renderCard = (report) => (
    <div
      key={report.id}
      className="report-card"
      onClick={() => navigate(`/${report.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/${report.id}`);
        }
      }}
    >
      <h3 className="report-card-name">{report.name}</h3>
      <p className="report-card-filed-by">{report.filedBy}</p>
      <p className="report-card-frequency">{report.frequency}</p>
    </div>
  );

  return (
    <div className="report-selector-container">
      <div className="report-selector">
        <div className="selector-header">
          <h1>MDRS Crew Report System</h1>
          <p>Select a report type to begin</p>
        </div>

        <section className="report-section">
          <h2>Daily Reports</h2>
          <div className="report-cards-grid">
            {dailyReports.map(renderCard)}
          </div>
        </section>

        <section className="report-section">
          <h2>Mission Reports</h2>
          <div className="report-cards-grid">
            {missionReports.map(renderCard)}
          </div>
        </section>

        <section className="report-section">
          <h2>Other</h2>
          <div className="report-cards-grid">
            <div
              className="report-card"
              onClick={() => navigate('/view-reports')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/view-reports');
                }
              }}
            >
              <h3 className="report-card-name">View Reports</h3>
              <p className="report-card-filed-by">All Crew</p>
              <p className="report-card-frequency">Browse submitted reports</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportSelector;
