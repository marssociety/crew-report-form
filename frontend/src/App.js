import React, { useState } from 'react';
import CrewReportForm from './components/CrewReport';
import GreenHabReportForm from './components/GreenHabReport';
import MarsFlag from './Flag-Mars.svg';
import './App.css';

function App() {
  const [currentForm, setCurrentForm] = useState('crew-report');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img src={MarsFlag} alt="Mars Flag" className="mars-flag-logo" />
          <h1>Mars Society Crew Report System</h1>
          <nav className="form-navigation">
            <a
              href="#crew-report"
              onClick={() => setCurrentForm('crew-report')}
              className={currentForm === 'crew-report' ? 'nav-link active' : 'nav-link'}
            >
              Crew Report
            </a>
            <span className="nav-separator">|</span>
            <a
              href="#greenhab"
              onClick={() => setCurrentForm('greenhab')}
              className={currentForm === 'greenhab' ? 'nav-link active' : 'nav-link'}
            >
              GreenHab Report
            </a>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentForm === 'crew-report' && <CrewReportForm />}
        {currentForm === 'greenhab' && <GreenHabReportForm />}
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
