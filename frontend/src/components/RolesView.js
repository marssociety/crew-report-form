import React, { useState, useEffect } from 'react';
import './RolesView.css';

const RolesView = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [station, setStation] = useState('MDRS');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/roles`);
        if (!response.ok) throw new Error('Failed to fetch roles');
        const data = await response.json();
        setRoles(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) return <div className="roles-view"><div className="roles-loading">Loading roles...</div></div>;
  if (error) return <div className="roles-view"><div className="roles-error">Error: {error}</div></div>;

  return (
    <div className="roles-view">
      <h1>Station Roles</h1>

      <div className="station-selector">
        <label htmlFor="station-select">Station:</label>
        <select
          id="station-select"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          <option value="MDRS">MDRS</option>
          <option value="FMARS" disabled>FMARS (coming soon)</option>
        </select>
      </div>

      <div className="roles-list">
        {roles.length === 0 ? (
          <div className="empty-message">No roles defined for {station}.</div>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="role-name-cell">{role.name}</td>
                  <td className="role-description-cell">{role.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RolesView;
