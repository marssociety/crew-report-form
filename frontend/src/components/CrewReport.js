import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import './CrewReport.css';

const CrewReportForm = () => {
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      report_id: uuidv4(),
      publish_date: new Date().toISOString(),
      crew_members: [],
      incidents: [],
      eva_data: {
        participants: [],
        objectives: []
      }
    }
  });

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({
    control,
    name: 'crew_members'
  });

  const { fields: incidentFields, append: appendIncident, remove: removeIncident } = useFieldArray({
    control,
    name: 'incidents'
  });

  const { fields: participantFields, append: appendParticipant, remove: removeParticipant } = useFieldArray({
    control,
    name: 'eva_data.participants'
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control,
    name: 'eva_data.objectives'
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitStatus('submitting');

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        const result = await response.json();
        console.log('Report submitted:', result);
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        console.error('Validation errors:', error.errors);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crew-report-form">
      <h1>Crew Report Form</h1>
      
      {submitStatus === 'success' && (
        <div className="alert alert-success">Report submitted successfully!</div>
      )}
      
      {submitStatus === 'error' && (
        <div className="alert alert-error">Error submitting report. Please check the form.</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <section>
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Report ID</label>
            <input
              {...register('report_id', { required: 'Report ID is required' })}
              readOnly
              className="readonly"
            />
            {errors.report_id && <span className="error">{errors.report_id.message}</span>}
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 1, message: 'Title must not be empty' },
                maxLength: { value: 200, message: 'Title must be 200 characters or less' }
              })}
              placeholder="Report title"
            />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label>Author *</label>
            <input
              {...register('author', { 
                required: 'Author is required',
                minLength: { value: 1, message: 'Author must not be empty' },
                maxLength: { value: 100, message: 'Author must be 100 characters or less' }
              })}
              placeholder="Report author"
            />
            {errors.author && <span className="error">{errors.author.message}</span>}
          </div>

          <div className="form-group">
            <label>Station *</label>
            <select {...register('station', { required: 'Station is required' })}>
              <option value="">Select a station</option>
              <option value="MDRS">MDRS</option>
              <option value="FMARS">FMARS</option>
              <option value="HI-SEAS">HI-SEAS</option>
              <option value="LUNARES">LUNARES</option>
            </select>
            {errors.station && <span className="error">{errors.station.message}</span>}
          </div>

          <div className="form-group">
            <label>Mission Name *</label>
            <input
              {...register('mission_name', { 
                required: 'Mission name is required',
                minLength: { value: 1, message: 'Mission name must not be empty' },
                maxLength: { value: 100, message: 'Mission name must be 100 characters or less' }
              })}
              placeholder="Mission name or identifier"
            />
            {errors.mission_name && <span className="error">{errors.mission_name.message}</span>}
          </div>

          <div className="form-group">
            <label>Crew Number *</label>
            <input
              {...register('crew_number', { 
                required: 'Crew number is required',
                pattern: { value: /^[A-Z0-9-]+$/, message: 'Must contain only uppercase letters, numbers, and hyphens' }
              })}
              placeholder="e.g., CREW-001"
            />
            {errors.crew_number && <span className="error">{errors.crew_number.message}</span>}
          </div>

          <div className="form-group">
            <label>Mission Type *</label>
            <select {...register('mission_type', { required: 'Mission type is required' })}>
              <option value="">Select mission type</option>
              <option value="Research">Research</option>
              <option value="Training">Training</option>
              <option value="Educational">Educational</option>
              <option value="Engineering">Engineering</option>
            </select>
            {errors.mission_type && <span className="error">{errors.mission_type.message}</span>}
          </div>

          <div className="form-group">
            <label>Mission Start Date *</label>
            <input
              type="datetime-local"
              {...register('mission_start_date', { required: 'Mission start date is required' })}
            />
            {errors.mission_start_date && <span className="error">{errors.mission_start_date.message}</span>}
          </div>

          <div className="form-group">
            <label>Mission Duration (Days) *</label>
            <input
              type="number"
              {...register('mission_duration_day', { 
                required: 'Mission duration is required',
                min: { value: 1, message: 'Duration must be at least 1 day' },
                max: { value: 365, message: 'Duration cannot exceed 365 days' }
              })}
              min="1"
              max="365"
            />
            {errors.mission_duration_day && <span className="error">{errors.mission_duration_day.message}</span>}
          </div>

          <div className="form-group">
            <label>Report Date *</label>
            <input
              type="datetime-local"
              {...register('report_date', { required: 'Report date is required' })}
            />
            {errors.report_date && <span className="error">{errors.report_date.message}</span>}
          </div>

          <div className="form-group">
            <label>Report Type *</label>
            <select {...register('report_type', { required: 'Report type is required' })}>
              <option value="">Select report type</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="EVA">EVA</option>
              <option value="Incident">Incident</option>
              <option value="Final">Final</option>
            </select>
            {errors.report_type && <span className="error">{errors.report_type.message}</span>}
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              {...register('content', { 
                required: 'Content is required',
                minLength: { value: 10, message: 'Content must be at least 10 characters long' }
              })}
              rows="6"
              placeholder="Main report content..."
            />
            {errors.content && <span className="error">{errors.content.message}</span>}
          </div>
        </section>

        {/* EVA Data */}
        <section>
          <h2>EVA Data (Optional)</h2>
          
          <div className="form-group">
            <label>EVA Number</label>
            <input
              type="number"
              {...register('eva_data.eva_number', { min: { value: 1, message: 'EVA number must be positive' } })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Duration (Minutes)</label>
            <input
              type="number"
              {...register('eva_data.duration_minutes', { min: { value: 1, message: 'Duration must be positive' } })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Safety Notes</label>
            <textarea
              {...register('eva_data.safety_notes')}
              rows="3"
              placeholder="Safety notes and observations..."
            />
          </div>

          <div className="form-group">
            <label>Participants</label>
            {participantFields.map((field, index) => (
              <div key={field.id} className="array-item">
                <input
                  {...register(`eva_data.participants.${index}`, { required: 'Participant name is required' })}
                  placeholder="Participant name"
                />
                <button type="button" onClick={() => removeParticipant(index)} className="remove-btn">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => appendParticipant('')} className="add-btn">
              Add Participant
            </button>
          </div>

          <div className="form-group">
            <label>Objectives</label>
            {objectiveFields.map((field, index) => (
              <div key={field.id} className="array-item">
                <input
                  {...register(`eva_data.objectives.${index}`)}
                  placeholder="Objective description"
                />
                <button type="button" onClick={() => removeObjective(index)} className="remove-btn">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => appendObjective('')} className="add-btn">
              Add Objective
            </button>
          </div>
        </section>

        {/* Crew Members */}
        <section>
          <h2>Crew Members (Optional)</h2>
          {crewFields.map((field, index) => (
            <div key={field.id} className="crew-member">
              <h3>Crew Member {index + 1}</h3>
              
              <div className="form-group">
                <label>Name</label>
                <input
                  {...register(`crew_members.${index}.name`, { required: 'Name is required' })}
                  placeholder="Crew member name"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select {...register(`crew_members.${index}.role`, { required: 'Role is required' })}>
                  <option value="">Select role</option>
                  <option value="Commander">Commander</option>
                  <option value="Executive Officer">Executive Officer</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Scientist">Scientist</option>
                  <option value="Health & Safety Officer">Health & Safety Officer</option>
                  <option value="Journalist">Journalist</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select {...register(`crew_members.${index}.status`, { required: 'Status is required' })}>
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Departed">Departed</option>
                </select>
              </div>

              <button type="button" onClick={() => removeCrew(index)} className="remove-btn">
                Remove Crew Member
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendCrew({ name: '', role: '', status: '' })} className="add-btn">
            Add Crew Member
          </button>
        </section>

        {/* Resources */}
        <section>
          <h2>Resources (Optional)</h2>
          
          <div className="form-group">
            <label>Water Usage (Liters)</label>
            <input
              type="number"
              step="0.1"
              {...register('resources.water_usage_liters', { min: { value: 0, message: 'Must be non-negative' } })}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Power Usage (kWh)</label>
            <input
              type="number"
              step="0.1"
              {...register('resources.power_usage_kwh', { min: { value: 0, message: 'Must be non-negative' } })}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Food Consumption</label>
            <textarea
              {...register('resources.food_consumption')}
              rows="2"
              placeholder="Description of food consumption..."
            />
          </div>
        </section>

        {/* Environmental Data */}
        <section>
          <h2>Environmental Data (Optional)</h2>
          
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              {...register('environmental_data.temperature_celsius')}
            />
          </div>

          <div className="form-group">
            <label>Humidity (%)</label>
            <input
              type="number"
              step="0.1"
              {...register('environmental_data.humidity_percent', { 
                min: { value: 0, message: 'Must be between 0 and 100' },
                max: { value: 100, message: 'Must be between 0 and 100' }
              })}
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label>Pressure (kPa)</label>
            <input
              type="number"
              step="0.1"
              {...register('environmental_data.pressure_kpa', { min: { value: 0, message: 'Must be non-negative' } })}
              min="0"
            />
          </div>
        </section>

        {/* Incidents */}
        <section>
          <h2>Incidents (Optional)</h2>
          {incidentFields.map((field, index) => (
            <div key={field.id} className="incident">
              <h3>Incident {index + 1}</h3>
              
              <div className="form-group">
                <label>Incident ID</label>
                <input
                  {...register(`incidents.${index}.incident_id`, { required: 'Incident ID is required' })}
                  placeholder="Unique incident identifier"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select {...register(`incidents.${index}.type`, { required: 'Type is required' })}>
                  <option value="">Select type</option>
                  <option value="Medical">Medical</option>
                  <option value="Equipment Failure">Equipment Failure</option>
                  <option value="Safety">Safety</option>
                  <option value="Environmental">Environmental</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select {...register(`incidents.${index}.severity`, { required: 'Severity is required' })}>
                  <option value="">Select severity</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  {...register(`incidents.${index}.description`, { required: 'Description is required' })}
                  rows="3"
                  placeholder="Incident description..."
                />
              </div>

              <div className="form-group">
                <label>Resolution</label>
                <textarea
                  {...register(`incidents.${index}.resolution`)}
                  rows="3"
                  placeholder="How the incident was resolved..."
                />
              </div>

              <button type="button" onClick={() => removeIncident(index)} className="remove-btn">
                Remove Incident
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendIncident({ 
            incident_id: '', 
            type: '', 
            severity: '', 
            description: '', 
            resolution: '' 
          })} className="add-btn">
            Add Incident
          </button>
        </section>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrewReportForm;
