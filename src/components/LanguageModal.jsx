import React from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const LanguageModal = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{t('language.label', {}, 'Language')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '20px' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              className={language === lang.value ? 'accent-button' : 'secondary-button'}
              style={{ padding: '12px' }}
              onClick={() => {
                setLanguage(lang.value);
                onClose();
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
