import React from 'react';
import './MainMenu.css';

const MainMenu = ({ onNavigate }) => {
  return (
    <div className="main-menu-container">
      <div className="main-menu">
        <h1 className="menu-title">Mars Society Crew Report System</h1>
        <div className="menu-buttons">
          <button
            className="menu-button"
            onClick={() => onNavigate('crew-report')}
          >
            Add Crew Report
          </button>
          <button
            className="menu-button"
            onClick={() => onNavigate('greenhab')}
          >
            Add GreenHab Report
          </button>
          <button
            className="menu-button"
            onClick={() => onNavigate('view-reports')}
          >
            View Crew Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
