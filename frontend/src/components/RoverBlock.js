import React from 'react';

const RoverBlock = ({ roverName, register, index }) => {
  const prefix = `rovers.${index}`;
  return (
    <div className="rover-block">
      <h3>{roverName}</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Used</label>
          <input type="text" {...register(`${prefix}.roverUsed`)} placeholder="Yes / No" />
        </div>
        <div className="form-group">
          <label>Hours</label>
          <input type="number" step="0.1" {...register(`${prefix}.hours`)} placeholder="Hours" />
        </div>
        <div className="form-group">
          <label>Beginning Charge (%)</label>
          <input type="number" step="1" {...register(`${prefix}.beginningCharge`)} placeholder="%" />
        </div>
        <div className="form-group">
          <label>Ending Charge (%)</label>
          <input type="number" step="1" {...register(`${prefix}.endingCharge`)} placeholder="%" />
        </div>
        <div className="form-group">
          <label>Currently Charging</label>
          <input type="text" {...register(`${prefix}.currentlyCharging`)} placeholder="Yes / No" />
        </div>
      </div>
    </div>
  );
};

export default RoverBlock;
