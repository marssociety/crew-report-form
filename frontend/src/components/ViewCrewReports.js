import React, { useState, useEffect, useCallback } from 'react';
import './ViewCrewReports.css';

const ViewCrewReports = ({ onViewReport }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    station: 'MDRS',
    crewNumber: '',
    reportType: 'ALL',
    author: '',
    searchText: ''
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...reports];

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(report =>
        new Date(report.report_date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(report =>
        new Date(report.report_date) <= new Date(filters.endDate)
      );
    }

    // Station filter
    if (filters.station !== 'ALL') {
      filtered = filtered.filter(report =>
        report.station === filters.station
      );
    }

    // Crew number filter
    if (filters.crewNumber) {
      filtered = filtered.filter(report =>
        report.crew_number.toLowerCase().includes(filters.crewNumber.toLowerCase())
      );
    }

    // Report type filter
    if (filters.reportType !== 'ALL') {
      filtered = filtered.filter(report =>
        report.report_type === filters.reportType
      );
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(report =>
        report.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // Search text filter (title, content, mission_name)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchLower) ||
        report.content.toLowerCase().includes(searchLower) ||
        report.mission_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      station: 'MDRS',
      crewNumber: '',
      reportType: 'ALL',
      author: '',
      searchText: ''
    });
  };

  if (loading) {
    return <div className="view-reports-loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="view-reports-error">Error: {error}</div>;
  }

  return (
    <div className="view-crew-reports">
      <h1>Crew Reports</h1>

      {/* Search and Filter Section */}
      <div className="filters-section">
        <h2>Search & Filter</h2>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Station</label>
            <select
              value={filters.station}
              onChange={(e) => handleFilterChange('station', e.target.value)}
            >
              <option value="ALL">All Stations</option>
              <option value="MDRS">MDRS</option>
              <option value="FMARS">FMARS</option>
              <option value="HI-SEAS">HI-SEAS</option>
              <option value="LUNARES">LUNARES</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="EVA">EVA</option>
              <option value="Incident">Incident</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Crew Number</label>
            <input
              type="text"
              value={filters.crewNumber}
              onChange={(e) => handleFilterChange('crewNumber', e.target.value)}
              placeholder="Search crew number..."
            />
          </div>

          <div className="filter-group">
            <label>Author</label>
            <input
              type="text"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              placeholder="Search author..."
            />
          </div>

          <div className="filter-group full-width">
            <label>Search Text (Title, Content, Mission Name)</label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              placeholder="Search in title, content, or mission name..."
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={resetFilters} className="reset-btn">
            Reset Filters
          </button>
          <span className="results-count">
            Showing {filteredReports.length} of {reports.length} reports
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="no-results">No reports found matching your criteria.</div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.report_id} className="report-card">
              <div className="report-card-header">
                <h3>{report.title}</h3>
                <button
                  className="view-button"
                  onClick={() => onViewReport(report.report_id)}
                >
                  View Details
                </button>
              </div>
              <table className="report-summary-table">
                <tbody>
                  <tr>
                    <td className="field-name">report_id</td>
                    <td className="field-value">{report.report_id}</td>
                  </tr>
                  <tr>
                    <td className="field-name">author</td>
                    <td className="field-value">{report.author}</td>
                  </tr>
                  <tr>
                    <td className="field-name">report_date</td>
                    <td className="field-value">{new Date(report.report_date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="field-name">station</td>
                    <td className="field-value">{report.station}</td>
                  </tr>
                  <tr>
                    <td className="field-name">crew_number</td>
                    <td className="field-value">{report.crew_number}</td>
                  </tr>
                  <tr>
                    <td className="field-name">mission_name</td>
                    <td className="field-value">{report.mission_name}</td>
                  </tr>
                  <tr>
                    <td className="field-name">report_type</td>
                    <td className="field-value">{report.report_type}</td>
                  </tr>
                  <tr>
                    <td className="field-name">mission_type</td>
                    <td className="field-value">{report.mission_type}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewCrewReports;
