import React from 'react';
import CoordinateInput from './CoordinateInput.jsx';
import SimbadSearch from './SimbadSearch.jsx';

/**
 * Astronomical Object Settings Component
 * Manages RA/Dec coordinates and SIMBAD search functionality
 */
const AstronomicalObjectSettings = ({
    raCoordinates,
    decCoordinates,
    onRaChange,
    onDecChange,
    onSimbadResult
}) => {
    
    const handleSimbadSelect = (searchResult) => {
        // Update coordinates when SIMBAD result is selected
        onRaChange({
            primary: Math.floor(searchResult.raHms.h),
            secondary: Math.floor(searchResult.raHms.m),
            tertiary: Math.round(searchResult.raHms.s * 100) / 100
        });
        
        onDecChange({
            primary: Math.floor(searchResult.decDms.d),
            secondary: Math.floor(Math.abs(searchResult.decDms.m)),
            tertiary: Math.round(Math.abs(searchResult.decDms.s) * 100) / 100
        });
        
        if (onSimbadResult) {
            onSimbadResult(searchResult);
        }
    };

    return (
        <div style={{ 
            background: 'rgba(68, 85, 119, 0.4)', 
            padding: '1.5rem', 
            borderRadius: '8px' 
        }}>
            <h3 style={{ 
                color: '#ffdd44', 
                marginBottom: '1rem',
                fontSize: '1.3rem'
            }}>
                Astronomical Object
            </h3>
            
            {/* SIMBAD Search */}
            <SimbadSearch onResultSelect={handleSimbadSelect} />
            
            {/* RA and Dec Coordinates */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                <CoordinateInput
                    type="RA"
                    values={raCoordinates}
                    onChange={onRaChange}
                    label="Right Ascension"
                    showInline={true}
                />
                
                <CoordinateInput
                    type="Dec"
                    values={decCoordinates}
                    onChange={onDecChange}
                    label="Declination"
                    showInline={true}
                />
            </div>
        </div>
    );
};

export default AstronomicalObjectSettings;