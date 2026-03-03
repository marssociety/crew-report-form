import React from 'react';
import './SharedHeader.css';

const SharedHeader = ({ register, errors }) => {
  return (
    <section className="shared-header">
      <h2>Report Information</h2>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="crewNumber">Crew Number *</label>
          <input type="number" id="crewNumber" {...register('crewNumber', { required: 'Crew number is required' })} placeholder="e.g., 271" />
          {errors.crewNumber && <span className="error">{errors.crewNumber.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="position">Position *</label>
          <input type="text" id="position" {...register('position', { required: 'Position is required' })} placeholder="e.g., Commander" />
          {errors.position && <span className="error">{errors.position.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="reportPreparedBy">Report Prepared By *</label>
          <input type="text" id="reportPreparedBy" {...register('reportPreparedBy', { required: 'Full name is required' })} placeholder="Your full legal name" />
          {errors.reportPreparedBy && <span className="error">{errors.reportPreparedBy.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input type="date" id="date" {...register('date', { required: 'Date is required' })} />
          {errors.date && <span className="error">{errors.date.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="sol">Sol *</label>
          <input type="number" id="sol" {...register('sol', { required: 'Sol is required', min: 1 })} placeholder="Mission day" />
          {errors.sol && <span className="error">{errors.sol.message}</span>}
        </div>
      </div>
    </section>
  );
};

export default SharedHeader;
