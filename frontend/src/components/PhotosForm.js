import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import { buildTemplatePayload } from '../utils/templatePayload';
import './PhotosForm.css';

const PhotosForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [photos, setPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      crewNumber: '',
      position: '',
      reportPreparedBy: '',
      date: new Date().toISOString().split('T')[0],
      sol: ''
    }
  });

  const watchedData = watch();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({
      file,
      caption: ''
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const updateCaption = (index, caption) => {
    setPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, caption } : photo))
    );
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} Photos of the Day ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    const photoList = photos.length > 0
      ? photos
          .map((p, i) => `  ${i + 1}. ${p.file.name}${p.caption ? ` - ${p.caption}` : ''}`)
          .join('\n')
      : '  (No photos selected)';

    return `Report title: Photos of the Day
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}

Photos (${photos.length} attached):
${photoList}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      if (photos.length > 0) {
        const formData = new FormData();
        formData.append('crewNumber', data.crewNumber);
        formData.append('position', data.position);
        formData.append('reportPreparedBy', data.reportPreparedBy);
        formData.append('date', data.date);
        formData.append('reportDate', data.date);
        formData.append('sol', data.sol);
        formData.append('reportType', 'photos');
        formData.append('emailSubject', generateEmailSubject());
        formData.append('emailBody', generateEmailBody(data));
        formData.append('submittedAt', new Date().toISOString());

        photos.forEach((photo, index) => {
          formData.append('photos', photo.file);
          formData.append(`captions[${index}]`, photo.caption);
        });

        const response = await fetch(`${apiUrl}/api/reports/photos`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setSubmitStatus({ type: 'success', message: 'Photos submitted successfully!' });
        } else {
          const errorData = await response.json();
          setSubmitStatus({ type: 'error', message: errorData.message || 'Failed to submit photos' });
        }
      } else {
        const reportData = buildTemplatePayload(
          data, 'photos_of_the_day',
          generateEmailSubject(),
          generateEmailBody(data)
        );

        const response = await fetch(`${apiUrl}/api/reports/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (response.ok) {
          setSubmitStatus({ type: 'success', message: 'Photos report submitted successfully!' });
        } else {
          const errorData = await response.json();
          setSubmitStatus({ type: 'error', message: errorData.message || 'Failed to submit report' });
        }
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    const emailContent = `Subject: ${generateEmailSubject()}\n\n${generateEmailBody(watchedData)}`;
    navigator.clipboard.writeText(emailContent);
    alert('Email content copied to clipboard!');
  };

  return (
    <div className="photos-form-container">
      <div className="form-header">
        <h1>Photos of the Day</h1>
        <p>Mars Society Analog Research Station - Daily Photo Submission</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="photos-form">
        {/* Shared Header */}
        <SharedHeader register={register} errors={errors} />

        {/* Photos of the Day */}
        <section className="form-section">
          <h2>Photos of the Day</h2>

          <div className="form-group">
            <label htmlFor="photoUpload">Select Photos</label>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="file-input"
            />
            <p className="help-text">Photo upload functionality - files will be stored locally on the server</p>
          </div>

          {photos.length > 0 && (
            <div className="photo-list">
              <h3>Selected Photos ({photos.length})</h3>
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <div className="photo-item-info">
                    <span className="photo-filename">{photo.file.name}</span>
                    <span className="photo-size">
                      ({(photo.file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="photo-item-caption">
                    <input
                      type="text"
                      placeholder="Add a caption for this photo"
                      value={photo.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="remove-photo-button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="handbook-note">
            Follow Handbook requirements (page 31) for photo specifications
          </p>
        </section>

        {/* Email Preview */}
        <section className="form-section email-preview">
          <h2>Email Preview</h2>
          <div className="email-content">
            <div className="email-subject">
              <strong>Subject:</strong> {generateEmailSubject()}
            </div>
            <div className="email-body">
              <pre>{generateEmailBody(watchedData)}</pre>
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="copy-button"
            >
              Copy Email Content
            </button>
          </div>
        </section>

        {/* Submit Section */}
        <section className="form-section submit-section">
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Photos'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default PhotosForm;
