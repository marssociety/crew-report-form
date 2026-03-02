import React from 'react';
import './ChecklistGrid.css';

const ChecklistGrid = ({ sections, register, prefix, columns }) => {
  return (
    <div className="checklist-grid">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="checklist-section">
          <h3>{section.title}</h3>
          <div className="checklist-table">
            {columns && (
              <div className="checklist-header-row">
                <div className="checklist-item-col">Item</div>
                {columns.map((col, i) => (
                  <div key={i} className="checklist-check-col">{col}</div>
                ))}
                <div className="checklist-notes-col">Notes</div>
              </div>
            )}
            {section.items.map((item, iIdx) => (
              <div key={iIdx} className="checklist-row">
                <div className="checklist-item-col">{item.label}</div>
                {columns ? columns.map((col, cIdx) => (
                  <div key={cIdx} className="checklist-check-col">
                    <input
                      type="checkbox"
                      {...register(`${prefix}.${sIdx}.items.${iIdx}.checks.${cIdx}`)}
                    />
                  </div>
                )) : (
                  <div className="checklist-check-col">
                    <input
                      type="checkbox"
                      {...register(`${prefix}.${sIdx}.items.${iIdx}.confirmed`)}
                    />
                  </div>
                )}
                <div className="checklist-notes-col">
                  <input
                    type="text"
                    {...register(`${prefix}.${sIdx}.items.${iIdx}.notes`)}
                    placeholder="Notes"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChecklistGrid;
