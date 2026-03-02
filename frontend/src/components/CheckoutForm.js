import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import './CheckoutForm.css';

const CHECKOUT_SECTIONS = [
  {
    name: 'Science Dome',
    items: [
      'Equipment cleaned, organized and operational',
      'Inventory cleaned, organized',
      'All surfaces cleaned',
      'Window cleaned',
      'All benches washed',
      'Floor vacuumed and mopped (no mud)',
      'Vacuum emptied',
      'Greywater emptied',
      'All personal items removed',
      'If applicable: samples autoclaved',
      'Trash removed and new bags installed',
      'Radios/intercom operational',
      'No damage/damage',
    ],
  },
  {
    name: 'GreenHab',
    items: [
      'Inventory cleaned, organized',
      'All surfaces cleaned',
      'Floor swept',
      'Plants in good condition',
      'All dead plants removed',
      'All personal items removed',
      'Equipment cleaned, organized and operational',
      'Trash removed and new bags installed',
      'Radios/intercom operational',
      'No damage/damage',
    ],
  },
  {
    name: 'Front Airlock',
    items: [
      'Floor vacuumed and mopped (no mud)',
      'Front porch swept',
    ],
  },
  {
    name: 'Lower Deck',
    items: [
      'Equipment cleaned, organized and operational',
      'Inventory cleaned, organized',
      'All surfaces cleaned',
      'Floor vacuumed and mopped (no mud)',
      'Vacuum emptied',
      'Mop clean and stowed',
      'Trash removed and new bags installed',
      'All personal items removed',
      'Stairs clean',
      'First aid supplies in order',
      'EVA Radios and earbuds clean and organized',
      'EVA suits charging and operational',
      'EVA suits cleaned and undamaged',
      'Radios/intercom operational',
    ],
  },
  {
    name: 'Shower Room/Toilet',
    items: [
      'All personal items removed',
      'Shower all surfaces cleaned',
      'Toilet all surfaces cleaned',
      'Sink clean',
      'Floor vacuumed and mopped',
      'Trash removed and new bags installed',
      'Toilet emptied (if not full, fill with water before emptying)',
    ],
  },
  {
    name: 'Rear Airlock',
    items: [
      'Floor vacuumed and mopped (no mud)',
      'Cement pad and step swept',
      'Tunnel cleared of debris, inspected and fixed (if applicable)',
      'If applicable: Solar Observatory cleaned and locked',
    ],
  },
  {
    name: 'Upper Deck',
    items: [
      'Remove all not applicable items from the loft',
      'Stove cleaned',
      'Oven cleaned',
      'Refrigerator cleared of food and cleaned',
      'All dishes washed and put away',
      'All appliances clean and stowed',
      'All appliances operational',
      'Remaining food organized',
      'Food inventory sent to Mission Support',
      'Table clean and correct number of chairs',
      'Floors vacuumed',
      "Crew's quarters cleaned, vacuumed and mopped",
      'Mattresses sprayed with Lysol and wiped',
      'Trash removed and new bag installed',
      'All personal items removed',
      'All surfaces cleaned',
      'No damage/damage',
      'Radios/intercom in place and operational',
      'Vacuum emptied if needed',
    ],
  },
  {
    name: 'Outside',
    items: [
      'Rovers checked for damage/dirt, cleaned of dirt',
      'All rovers charging (if applicable)',
      'HabCar checked (if applicable)',
      'Debris/trash removed from campus',
      'All burnable trash burned',
      'All vehicles in their proper places',
    ],
  },
  {
    name: 'RAM',
    items: [
      'Tools and supplies returned to proper place and organized',
      'All surfaces cleaned',
      'Floor vacuumed and mopped (no mud)',
      'Trash removed',
    ],
  },
];

const buildChecklistDefaults = () => {
  const checklist = {};
  CHECKOUT_SECTIONS.forEach((section) => {
    checklist[section.name] = {};
    section.items.forEach((item, idx) => {
      checklist[section.name][idx] = {
        crewConfirmed: false,
        staffConfirmed: false,
        notes: '',
      };
    });
  });
  return checklist;
};

const CheckoutForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
      sol: '',
      checklist: buildChecklistDefaults(),
      damages: '',
      repairEstimate: '',
      cleaningFeeEstimate: '',
      cleaningFeeActual: '',
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} Checkout Checklist ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    let body = `Report title: Checkout Checklist
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}
`;

    CHECKOUT_SECTIONS.forEach((section) => {
      body += `\n${section.name.toUpperCase()}:\n`;
      section.items.forEach((item, idx) => {
        const itemData = data.checklist && data.checklist[section.name] && data.checklist[section.name][idx];
        const crew = itemData && itemData.crewConfirmed ? 'YES' : 'NO';
        const staff = itemData && itemData.staffConfirmed ? 'YES' : 'NO';
        const notes = itemData && itemData.notes ? ` - Notes: ${itemData.notes}` : '';
        body += `  ${item}: Crew=${crew}, Staff=${staff}${notes}\n`;
      });
    });

    body += `\nSUMMARY:
Damages: ${data.damages || 'N/A'}
Repair estimate: ${data.repairEstimate || 'N/A'}
Cleaning fee estimate: ${data.cleaningFeeEstimate || 'N/A'}
Cleaning fee actual: ${data.cleaningFeeActual || 'N/A'}`;

    return body;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reportData = {
        ...data,
        reportDate: data.date,
        reportType: 'checkout',
        emailSubject: generateEmailSubject(),
        emailBody: generateEmailBody(data),
        submittedAt: new Date().toISOString()
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Checkout Checklist submitted successfully!' });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ type: 'error', message: errorData.message || 'Failed to submit report' });
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
    <div className="checkout-form-container">
      <div className="form-header">
        <h1>Checkout Checklist</h1>
        <p>Mars Desert Research Station - End of Mission Facility Inspection</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
        <SharedHeader register={register} errors={errors} />

        {/* Checklist Sections */}
        {CHECKOUT_SECTIONS.map((section) => (
          <section key={section.name} className="form-section">
            <h2>{section.name}</h2>

            <div className="checklist-table-wrapper">
              <table className="checklist-table">
                <thead>
                  <tr>
                    <th className="item-col">Item</th>
                    <th className="check-col">Crew &#10003;</th>
                    <th className="check-col">Staff &#10003;</th>
                    <th className="notes-col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="item-cell">{item}</td>
                      <td className="check-cell">
                        <input
                          type="checkbox"
                          {...register(`checklist.${section.name}.${idx}.crewConfirmed`)}
                        />
                      </td>
                      <td className="check-cell">
                        <input
                          type="checkbox"
                          {...register(`checklist.${section.name}.${idx}.staffConfirmed`)}
                        />
                      </td>
                      <td className="notes-cell">
                        <input
                          type="text"
                          {...register(`checklist.${section.name}.${idx}.notes`)}
                          placeholder="Notes..."
                          className="notes-input"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Summary */}
        <section className="form-section">
          <h2>Summary</h2>

          <div className="form-group">
            <label htmlFor="damages">Damages</label>
            <textarea
              id="damages"
              {...register('damages')}
              placeholder="Describe any damages found during checkout inspection"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="repairEstimate">Repair Estimate</label>
              <input
                type="text"
                id="repairEstimate"
                {...register('repairEstimate')}
                placeholder="Estimated repair costs"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cleaningFeeEstimate">Cleaning Fee Estimate</label>
              <input
                type="text"
                id="cleaningFeeEstimate"
                {...register('cleaningFeeEstimate')}
                placeholder="Estimated cleaning fees"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cleaningFeeActual">Cleaning Fee Actual</label>
              <input
                type="text"
                id="cleaningFeeActual"
                {...register('cleaningFeeActual')}
                placeholder="Actual cleaning fees"
              />
            </div>
          </div>
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
            {isSubmitting ? 'Submitting...' : 'Submit Checkout Checklist'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default CheckoutForm;
