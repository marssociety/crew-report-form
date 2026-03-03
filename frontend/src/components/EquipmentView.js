import React, { useState, useEffect, useMemo } from 'react';
import './EquipmentView.css';

const EquipmentView = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortField, setSortField] = useState('equipment_name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/equipment`);
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        setEquipment(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const equipmentTypes = useMemo(() => {
    const types = new Set(equipment.map(e => e.equipment_type).filter(Boolean));
    return ['ALL', ...Array.from(types).sort()];
  }, [equipment]);

  const filteredAndSorted = useMemo(() => {
    let items = [...equipment];
    if (typeFilter !== 'ALL') {
      items = items.filter(e => e.equipment_type === typeFilter);
    }
    items.sort((a, b) => {
      const aVal = (a[sortField] ?? '').toString().toLowerCase();
      const bVal = (b[sortField] ?? '').toString().toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [equipment, typeFilter, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  };

  if (loading) return <div className="equipment-view"><div className="equipment-loading">Loading equipment...</div></div>;
  if (error) return <div className="equipment-view"><div className="equipment-error">Error: {error}</div></div>;

  return (
    <div className="equipment-view">
      <h1>Equipment</h1>

      <div className="equipment-filters">
        <div className="filter-group">
          <label htmlFor="type-filter">Equipment Type:</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {equipmentTypes.map(type => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
        <span className="results-count">
          Showing {filteredAndSorted.length} of {equipment.length} items
        </span>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="empty-message">No equipment found.</div>
      ) : (
        <div className="equipment-table-wrapper">
          <table className="equipment-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('equipment_name')}>
                  Name{sortIndicator('equipment_name')}
                </th>
                <th className="sortable" onClick={() => handleSort('equipment_type')}>
                  Type{sortIndicator('equipment_type')}
                </th>
                <th>Description</th>
                <th className="sortable" onClick={() => handleSort('first_used')}>
                  First Used{sortIndicator('first_used')}
                </th>
                <th className="sortable" onClick={() => handleSort('last_used')}>
                  Last Used{sortIndicator('last_used')}
                </th>
                <th className="sortable" onClick={() => handleSort('usage_count')}>
                  Usage Count{sortIndicator('usage_count')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((item) => (
                <tr key={item.id}>
                  <td className="equipment-name-cell">{item.equipment_name || '—'}</td>
                  <td>{item.equipment_type || '—'}</td>
                  <td>{item.description || '—'}</td>
                  <td>{item.first_used || '—'}</td>
                  <td>{item.last_used || '—'}</td>
                  <td className="usage-count-cell">{item.usage_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EquipmentView;
