import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
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
import { CrewsList, CrewRoster } from './components/CrewsView';
import RolesView from './components/RolesView';
import EquipmentView from './components/EquipmentView';
import MarsFlag from './Flag-Mars.svg';
import './App.css';

const FORM_ROUTES = [
  '/sol-summary', '/operations', '/greenhab', '/eva-report', '/eva-request',
  '/journalist', '/photos', '/astronomy', '/hso-checklist', '/checkout', '/food-inventory'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('crew-reports-auth') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const location = useLocation();

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'hanksville') {
      setIsAuthenticated(true);
      sessionStorage.setItem('crew-reports-auth', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
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

  const isFormView = FORM_ROUTES.includes(location.pathname);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img src={MarsFlag} alt="Mars Flag" className="mars-flag-logo" />
          <h1>Mars Society Crew Report System</h1>
          <nav className="form-navigation">
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              New Report
            </Link>
            <span className="nav-separator">|</span>
            <Link
              to="/view-reports"
              className={location.pathname.startsWith('/view-reports') ? 'nav-link active' : 'nav-link'}
            >
              View Reports
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<ReportSelector />} />
          <Route path="/sol-summary" element={<SolSummaryForm />} />
          <Route path="/operations" element={<OperationsForm />} />
          <Route path="/greenhab" element={<GreenHabReportForm />} />
          <Route path="/eva-report" element={<EvaReportForm />} />
          <Route path="/eva-request" element={<EvaRequestForm />} />
          <Route path="/journalist" element={<JournalistForm />} />
          <Route path="/photos" element={<PhotosForm />} />
          <Route path="/astronomy" element={<AstronomyForm />} />
          <Route path="/hso-checklist" element={<HsoChecklistForm />} />
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/food-inventory" element={<FoodInventoryForm />} />
          <Route path="/view-reports" element={<ViewCrewReports />} />
          <Route path="/view-reports/:id" element={<CrewReportView />} />
          <Route path="/crews" element={<CrewsList />} />
          <Route path="/crews/:id" element={<CrewRoster />} />
          <Route path="/roles" element={<RolesView />} />
          <Route path="/equipment" element={<EquipmentView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {isFormView && (
          <div className="back-to-menu">
            <Link to="/" className="back-button">
              &larr; Back to Report Selector
            </Link>
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
