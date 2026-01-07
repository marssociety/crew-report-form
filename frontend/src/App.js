import React, { useState } from 'react';
import CrewReportForm from './components/CrewReport';
import GreenHabReportForm from './components/GreenHabReport';
import MainMenu from './components/MainMenu';
import ViewCrewReports from './components/ViewCrewReports';
import CrewReportView from './components/CrewReportView';
import MarsFlag from './Flag-Mars.svg';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [selectedReportId, setSelectedReportId] = useState(null);

  const handleNavigation = (view) => {
    setCurrentView(view);
    setSelectedReportId(null);
  };

  const handleViewReport = (reportId) => {
    setSelectedReportId(reportId);
    setCurrentView('report-detail');
  };

  const handleBackToReportsList = () => {
    setCurrentView('view-reports');
    setSelectedReportId(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img src={MarsFlag} alt="Mars Flag" className="mars-flag-logo" />
          <h1>Mars Society Crew Report System</h1>
          <nav className="form-navigation">
            <a
              href="#home"
              onClick={() => handleNavigation('menu')}
              className={currentView === 'menu' ? 'nav-link active' : 'nav-link'}
            >
              Home
            </a>
            <span className="nav-separator">|</span>
            <a
              href="#crew-report"
              onClick={() => handleNavigation('crew-report')}
              className={currentView === 'crew-report' ? 'nav-link active' : 'nav-link'}
            >
              Add Crew Report
            </a>
            <span className="nav-separator">|</span>
            <a
              href="#greenhab"
              onClick={() => handleNavigation('greenhab')}
              className={currentView === 'greenhab' ? 'nav-link active' : 'nav-link'}
            >
              Add GreenHab Report
            </a>
            <span className="nav-separator">|</span>
            <a
              href="#view-reports"
              onClick={() => handleNavigation('view-reports')}
              className={currentView === 'view-reports' || currentView === 'report-detail' ? 'nav-link active' : 'nav-link'}
            >
              View Reports
            </a>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'menu' && <MainMenu onNavigate={handleNavigation} />}
        {currentView === 'crew-report' && <CrewReportForm />}
        {currentView === 'greenhab' && <GreenHabReportForm />}
        {currentView === 'view-reports' && <ViewCrewReports onViewReport={handleViewReport} />}
        {currentView === 'report-detail' && selectedReportId && (
          <CrewReportView reportId={selectedReportId} onBack={handleBackToReportsList} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Copyright &copy; 2026 The Mars Society &middot;{' '}
          <a href="https://mdrs.marssociety.org" target="_blank" rel="noopener noreferrer">
            MDRS
          </a>
          {' '}&middot;{' '}
          <a href="https://reports.marssociety.org" target="_blank" rel="noopener noreferrer">
            Reports
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
