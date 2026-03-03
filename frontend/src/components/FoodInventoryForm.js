import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SharedHeader from './SharedHeader';
import { buildTemplatePayload } from '../utils/templatePayload';
import './FoodInventoryForm.css';

const FOOD_INVENTORY_TEMPLATE = [
  { category: 'Baking', items: [
    { name: 'All-Purpose Flour', amount: 5, unit: 'lbs', weight: '5' },
    { name: 'Sugar', amount: 4, unit: 'lbs', weight: '4' },
    { name: 'Brown Sugar', amount: 2, unit: 'lbs', weight: '2' },
    { name: 'Baking Powder', amount: 1, unit: 'can', weight: '0.5' },
    { name: 'Baking Soda', amount: 1, unit: 'box', weight: '1' },
    { name: 'Vanilla Extract', amount: 1, unit: 'bottle', weight: '0.5' },
    { name: 'Yeast', amount: 2, unit: 'packets', weight: '0.2' },
  ]},
  { category: 'Freeze Dried', items: [
    { name: 'Freeze Dried Fruit', amount: 6, unit: 'bags', weight: '3' },
    { name: 'Freeze Dried Vegetables', amount: 6, unit: 'bags', weight: '3' },
    { name: 'Freeze Dried Meals', amount: 12, unit: 'pouches', weight: '6' },
  ]},
  { category: 'Cereal', items: [
    { name: 'Oatmeal', amount: 3, unit: 'canisters', weight: '6' },
    { name: 'Granola', amount: 2, unit: 'bags', weight: '4' },
    { name: 'Cereal', amount: 2, unit: 'boxes', weight: '2' },
  ]},
  { category: 'Dairy', items: [
    { name: 'Powdered Milk', amount: 4, unit: 'boxes', weight: '4' },
    { name: 'Shelf-Stable Cheese', amount: 3, unit: 'packages', weight: '3' },
    { name: 'Butter (canned)', amount: 2, unit: 'cans', weight: '2' },
  ]},
  { category: 'Canned Goods', items: [
    { name: 'Canned Tomatoes', amount: 8, unit: 'cans', weight: '12' },
    { name: 'Canned Beans', amount: 8, unit: 'cans', weight: '12' },
    { name: 'Canned Corn', amount: 4, unit: 'cans', weight: '6' },
    { name: 'Canned Soup', amount: 6, unit: 'cans', weight: '9' },
    { name: 'Canned Tuna/Chicken', amount: 6, unit: 'cans', weight: '6' },
  ]},
  { category: 'Grains & Pasta', items: [
    { name: 'Rice', amount: 10, unit: 'lbs', weight: '10' },
    { name: 'Pasta', amount: 6, unit: 'boxes', weight: '6' },
    { name: 'Couscous', amount: 2, unit: 'boxes', weight: '2' },
    { name: 'Quinoa', amount: 2, unit: 'bags', weight: '2' },
  ]},
  { category: 'Proteins', items: [
    { name: 'Canned Meat', amount: 6, unit: 'cans', weight: '6' },
    { name: 'Jerky', amount: 4, unit: 'bags', weight: '2' },
    { name: 'Protein Bars', amount: 24, unit: 'bars', weight: '4' },
    { name: 'Peanut Butter', amount: 3, unit: 'jars', weight: '6' },
  ]},
  { category: 'Snacks', items: [
    { name: 'Trail Mix', amount: 4, unit: 'bags', weight: '4' },
    { name: 'Crackers', amount: 4, unit: 'boxes', weight: '4' },
    { name: 'Dried Fruit', amount: 3, unit: 'bags', weight: '3' },
    { name: 'Chocolate', amount: 4, unit: 'bars', weight: '2' },
  ]},
  { category: 'Beverages', items: [
    { name: 'Coffee', amount: 3, unit: 'cans', weight: '3' },
    { name: 'Tea', amount: 4, unit: 'boxes', weight: '2' },
    { name: 'Hot Chocolate', amount: 2, unit: 'canisters', weight: '3' },
    { name: 'Powdered Drink Mix', amount: 6, unit: 'packets', weight: '3' },
  ]},
  { category: 'Condiments & Spices', items: [
    { name: 'Salt', amount: 2, unit: 'containers', weight: '2' },
    { name: 'Pepper', amount: 1, unit: 'container', weight: '0.5' },
    { name: 'Olive Oil', amount: 2, unit: 'bottles', weight: '4' },
    { name: 'Soy Sauce', amount: 1, unit: 'bottle', weight: '1' },
    { name: 'Hot Sauce', amount: 2, unit: 'bottles', weight: '1' },
    { name: 'Ketchup', amount: 1, unit: 'bottle', weight: '2' },
    { name: 'Mustard', amount: 1, unit: 'bottle', weight: '1' },
  ]},
];

const buildFoodDefaults = () => {
  const food = {};
  FOOD_INVENTORY_TEMPLATE.forEach((category, catIdx) => {
    food[catIdx] = {};
    category.items.forEach((item, itemIdx) => {
      food[catIdx][itemIdx] = { remaining: '' };
    });
  });
  return food;
};

const FoodInventoryForm = () => {
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
      food: buildFoodDefaults(),
    }
  });

  const watchedData = watch();

  const generateEmailSubject = () => {
    const crewNum = watchedData.crewNumber || 'NNN';
    const date = watchedData.date
      ? new Date(watchedData.date).toLocaleDateString('en-GB')
      : 'dd-MM-yyyy';
    return `Crew ${crewNum} Food Inventory ${date}`;
  };

  const generateEmailBody = (data) => {
    const formatDate = (dateStr) => {
      return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'dd-MM-yyyy';
    };

    let body = `Report title: Food Inventory
Crew #: ${data.crewNumber}
Position: ${data.position}
Report prepared by: ${data.reportPreparedBy}
Date: ${formatDate(data.date)}
Sol: ${data.sol}
`;

    FOOD_INVENTORY_TEMPLATE.forEach((category, catIdx) => {
      body += `\n${category.category.toUpperCase()}:\n`;
      category.items.forEach((item, itemIdx) => {
        const remaining = data.food && data.food[catIdx] && data.food[catIdx][itemIdx]
          ? data.food[catIdx][itemIdx].remaining
          : '';
        const remainingStr = remaining || 'not reported';
        body += `  ${item.name} (${item.amount} ${item.unit}): Remaining: ${remainingStr}\n`;
      });
    });

    return body;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Transform nested food object into flat items array for schema compliance
      const items = [];
      FOOD_INVENTORY_TEMPLATE.forEach((category, catIdx) => {
        category.items.forEach((item, itemIdx) => {
          const remaining = data.food && data.food[catIdx] && data.food[catIdx][itemIdx]
            ? data.food[catIdx][itemIdx].remaining
            : '';
          items.push({
            foodType: category.category,
            itemName: item.name,
            startingAmount: String(item.amount),
            unit: item.unit,
            weightLbs: item.weight,
            remainingFraction: remaining || '',
          });
        });
      });

      // Replace nested food object with flat items array
      const { food, ...rest } = data;
      const transformedData = { ...rest, items };
      const reportData = buildTemplatePayload(
        transformedData, 'food_inventory',
        generateEmailSubject(),
        generateEmailBody(data)
      );

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports/food-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Food Inventory submitted successfully!' });
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
    <div className="food-inventory-form-container">
      <div className="form-header">
        <h1>Food Inventory Form</h1>
        <p>Mars Desert Research Station - Food Supply Inventory Report</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="food-inventory-form">
        <SharedHeader register={register} errors={errors} />

        {/* Food Inventory Tables */}
        {FOOD_INVENTORY_TEMPLATE.map((category, catIdx) => (
          <section key={catIdx} className="form-section">
            <h2>{category.category}</h2>

            <div className="food-table-wrapper">
              <table className="food-table">
                <thead>
                  <tr>
                    <th className="item-col">Item</th>
                    <th className="amount-col">Amount</th>
                    <th className="unit-col">Unit</th>
                    <th className="weight-col">Weight (lbs)</th>
                    <th className="remaining-col">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item, itemIdx) => (
                    <tr key={itemIdx}>
                      <td className="item-cell">{item.name}</td>
                      <td className="amount-cell">{item.amount}</td>
                      <td className="unit-cell">{item.unit}</td>
                      <td className="weight-cell">{item.weight}</td>
                      <td className="remaining-cell">
                        <input
                          type="text"
                          {...register(`food.${catIdx}.${itemIdx}.remaining`)}
                          placeholder="e.g., 1/2, 3/4, empty"
                          className="remaining-input"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

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
            {isSubmitting ? 'Submitting...' : 'Submit Food Inventory'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default FoodInventoryForm;
