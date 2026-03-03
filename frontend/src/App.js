import React, { useState } from 'react';
import ReportSelector from './components/ReportSelector';
import SolSummaryForm from './components/SolSummaryForm';
import OperationsForm from './components/OperationsForm';
import GreenHabReportForm from './components/GreenHabReport';
import EvaReportForm from './components/EvaReportForm';
import EvaRequestForm from './components/EvaRequestForm';
import JournalistForm from './components/JournalistForm';
import PhotosForm from './components/PhotosForm';
import AstronomyForm from './components/AstronomyForm';
import HsoChecklistForm from './components/HsoChecklistForm';
import CheckoutForm from './components/CheckoutForm';
import FoodInventoryForm from './components/FoodInventoryForm';
import ViewCrewReports from './components/ViewCrewReports';
import CrewReportView from './components/CrewReportView';
import MarsFlag from './Flag-Mars.svg';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentView, setCurrentView] = useState('menu');
  const [selectedReportId, setSelectedReportId] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'hanksville') {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <img src={MarsFlag} alt="Mars Flag" className="login-flag" />
          <h1>Mars Society Crew Report System</h1>
          <p>Enter the station password to continue.</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="login-input"
              autoFocus
            />
            <button type="submit" className="login-button">Enter</button>
            {passwordError && <p className="login-error">{passwordError}</p>}
          </form>
        </div>
      </div>
    );
  }

  const isFormView = !['menu', 'view-reports', 'report-detail'].includes(currentView);

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
              New Report
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
        {currentView === 'menu' && <ReportSelector onNavigate={handleNavigation} />}
        {currentView === 'sol-summary' && <SolSummaryForm />}
        {currentView === 'operations' && <OperationsForm />}
        {currentView === 'greenhab' && <GreenHabReportForm />}
        {currentView === 'eva-report' && <EvaReportForm />}
        {currentView === 'eva-request' && <EvaRequestForm />}
        {currentView === 'journalist' && <JournalistForm />}
        {currentView === 'photos' && <PhotosForm />}
        {currentView === 'astronomy' && <AstronomyForm />}
        {currentView === 'hso-checklist' && <HsoChecklistForm />}
        {currentView === 'checkout' && <CheckoutForm />}
        {currentView === 'food-inventory' && <FoodInventoryForm />}
        {currentView === 'view-reports' && <ViewCrewReports onViewReport={handleViewReport} />}
        {currentView === 'report-detail' && selectedReportId && (
          <CrewReportView reportId={selectedReportId} onBack={handleBackToReportsList} />
        )}
        {isFormView && (
          <div className="back-to-menu">
            <button onClick={() => handleNavigation('menu')} className="back-button">
              &larr; Back to Report Selector
            </button>
          </div>
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
