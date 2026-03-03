import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './CrewsView.css';

const CrewRoster = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crew, setCrew] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrewAndRoster = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const [crewRes, rosterRes] = await Promise.all([
          fetch(`${apiUrl}/api/crews/${id}`),
          fetch(`${apiUrl}/api/crews/${id}/roster`),
        ]);

        if (!crewRes.ok) throw new Error('Failed to fetch crew');
        const crewData = await crewRes.json();
        setCrew(crewData);

        if (rosterRes.ok) {
          const rosterData = await rosterRes.json();
          setRoster(rosterData);
        }

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCrewAndRoster();
  }, [id]);

  if (loading) return <div className="crews-view"><div className="crews-loading">Loading crew...</div></div>;
  if (error) return <div className="crews-view"><div className="crews-error">Error: {error}</div></div>;
  if (!crew) return <div className="crews-view"><div className="crews-error">Crew not found</div></div>;

  return (
    <div className="crews-view">
      <div className="crew-detail-header">
        <h1>Crew {crew.crew_number}{crew.crew_name ? ` — ${crew.crew_name}` : ''}</h1>
        <button onClick={() => navigate('/crews')} className="back-button">
          Back to Crews
        </button>
      </div>

      <div className="crew-info-section">
        <table className="crew-info-table">
          <tbody>
            <tr><td className="field-name">Crew Number</td><td className="field-value">{crew.crew_number}</td></tr>
            {crew.crew_name && <tr><td className="field-name">Crew Name</td><td className="field-value">{crew.crew_name}</td></tr>}
            {crew.start_date && <tr><td className="field-name">Start Date</td><td className="field-value">{crew.start_date}</td></tr>}
            {crew.end_date && <tr><td className="field-name">End Date</td><td className="field-value">{crew.end_date}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="roster-section">
        <h2>Crew Roster</h2>
        {roster.length === 0 ? (
          <p className="empty-message">No crew members assigned yet.</p>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Affiliation</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((member, idx) => (
                <tr key={idx}>
                  <td>{member.member_name}</td>
                  <td>{member.role_name}</td>
                  <td>{member.member_email || '—'}</td>
                  <td>{member.member_affiliation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="crew-reports-link">
        <Link to={`/view-reports?crew=${crew.crew_number}`} className="view-reports-btn">
          View Reports for Crew {crew.crew_number}
        </Link>
      </div>
    </div>
  );
};

const CrewsList = () => {
  const navigate = useNavigate();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/crews`);
        if (!response.ok) throw new Error('Failed to fetch crews');
        const data = await response.json();
        setCrews(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCrews();
  }, []);

  if (loading) return <div className="crews-view"><div className="crews-loading">Loading crews...</div></div>;
  if (error) return <div className="crews-view"><div className="crews-error">Error: {error}</div></div>;

  return (
    <div className="crews-view">
      <h1>Crews</h1>

      {crews.length === 0 ? (
        <div className="empty-message">No crews found.</div>
      ) : (
        <div className="crews-table-wrapper">
          <table className="crews-table">
            <thead>
              <tr>
                <th>Crew Number</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {crews.map((crew) => (
                <tr key={crew.id} className="crew-row" onClick={() => navigate(`/crews/${crew.id}`)}>
                  <td className="crew-number-cell">{crew.crew_number}</td>
                  <td>{crew.crew_name || '—'}</td>
                  <td>{crew.start_date || '—'}</td>
                  <td>{crew.end_date || '—'}</td>
                  <td>
                    <button className="view-button" onClick={(e) => { e.stopPropagation(); navigate(`/crews/${crew.id}`); }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export { CrewsList, CrewRoster };
export default CrewsList;
