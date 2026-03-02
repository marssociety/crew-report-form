import React, { useState } from 'react';
import './ContextualHelp.css';

const ContextualHelp = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="contextual-help">
      <button type="button" className="help-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '\u25BC' : '\u25B6'} {title}
      </button>
      {isOpen && <div className="help-content">{children}</div>}
    </div>
  );
};

export default ContextualHelp;
