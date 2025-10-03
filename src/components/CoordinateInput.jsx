import React from 'react';

/**
 * Reusable coordinate input component for HMS (Hours/Minutes/Seconds) and DMS (Degrees/Minutes/Seconds)
 * @param {object} props
 * @param {string} props.type - 'RA', 'Dec', 'Latitude', or 'Longitude'  
 * @param {object} props.values - Current coordinate values {primary, arcminutes, arcseconds, direction?}
 * @param {function} props.onChange - Callback when values change
 * @param {object} props.bounds - Min/max values for validation
 * @param {string} props.label - Display label for the coordinate group
 */
const CoordinateInput = ({ 
    type, 
    values, 
    onChange, 
    bounds = {}, 
    label,
    showInline = false 
}) => {
    const isRA = type === 'RA';
    const isLatLon = type === 'Latitude' || type === 'Longitude';
    
    // Default bounds for different coordinate types
    const defaultBounds = {
        RA: { primary: { min: 0, max: 23 }, secondary: { min: 0, max: 59 }, tertiary: { min: 0, max: 59.99 } },
        Dec: { primary: { min: -90, max: 90 }, secondary: { min: 0, max: 59 }, tertiary: { min: 0, max: 59.99 } },
        Latitude: { primary: { min: 0, max: 90 }, secondary: { min: 0, max: 59 }, tertiary: { min: 0, max: 59.99 } },
        Longitude: { primary: { min: 0, max: 180 }, secondary: { min: 0, max: 59 }, tertiary: { min: 0, max: 59.99 } }
    };
    
    const currentBounds = { ...defaultBounds[type], ...bounds };
    
    // Labels for each field type
    const labels = {
        RA: { primary: 'h', secondary: 'm', tertiary: 's' },
        Dec: { primary: '°', secondary: "'", tertiary: '"' },
        Latitude: { primary: '°', secondary: "'", tertiary: '"' },
        Longitude: { primary: '°', secondary: "'", tertiary: '"' }
    };
    
    const currentLabels = labels[type];
    
    const handleInputChange = (field, value) => {
        const parsedValue = field === 'direction' ? value : 
                           field === 'tertiary' ? parseFloat(value) : parseInt(value);
        
        if (field !== 'direction' && isNaN(parsedValue)) return;
        
        // Validate bounds
        if (field !== 'direction') {
            const fieldBounds = currentBounds[field] || currentBounds.primary;
            if (parsedValue < fieldBounds.min || parsedValue > fieldBounds.max) return;
        }
        
        onChange({
            ...values,
            [field]: parsedValue
        });
    };

    const inputStyle = {
        width: '70px',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '2px solid #555',
        backgroundColor: '#2a2a2a',
        color: '#ffffff',
        fontSize: '1rem'
    };

    const labelStyle = {
        color: '#cccccc',
        fontSize: '0.9rem',
        marginBottom: '0.25rem',
        display: 'block'
    };

    const containerStyle = showInline ? 
        { display: 'flex', gap: '0.3rem', alignItems: 'end' } :
        { marginBottom: '1rem' };

    const headerStyle = showInline ?
        { margin: '0 1rem 0 0', color: '#ffdd44', fontSize: '1rem', alignSelf: 'center' } :
        { margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' };

    return (
        <div>
            {label && <h4 style={headerStyle}>{label}</h4>}
            <div style={containerStyle}>
                <div>
                    <label style={labelStyle}>
                        {isRA ? 'Hours' : 'Degrees'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                            type="number"
                            min={currentBounds.primary.min}
                            max={currentBounds.primary.max}
                            value={values.primary}
                            onChange={(e) => handleInputChange('primary', e.target.value)}
                            style={inputStyle}
                        />
                        <span style={{ color: '#cccccc', fontSize: '1rem' }}>
                            {currentLabels.primary}
                        </span>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>
                        {isRA ? 'Minutes' : 'Arcminutes'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                            type="number"
                            min={currentBounds.secondary.min}
                            max={currentBounds.secondary.max}
                            value={values.secondary}
                            onChange={(e) => handleInputChange('secondary', e.target.value)}
                            style={inputStyle}
                        />
                        <span style={{ color: '#cccccc', fontSize: '1rem' }}>
                            {currentLabels.secondary}
                        </span>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>
                        {isRA ? 'Seconds' : 'Arcseconds'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                            type="number"
                            min={currentBounds.tertiary.min}
                            max={currentBounds.tertiary.max}
                            step={isRA ? "0.01" : "0.1"}
                            value={values.tertiary}
                            onChange={(e) => handleInputChange('tertiary', e.target.value)}
                            style={inputStyle}
                        />
                        <span style={{ color: '#cccccc', fontSize: '1rem' }}>
                            {currentLabels.tertiary}
                        </span>
                    </div>
                </div>

                {isLatLon && (
                    <div>
                        <label style={labelStyle}>Direction</label>
                        <select
                            value={values.direction}
                            onChange={(e) => handleInputChange('direction', e.target.value)}
                            style={{
                                ...inputStyle,
                                width: '60px',
                                cursor: 'pointer'
                            }}
                        >
                            {type === 'Latitude' ? (
                                <>
                                    <option value="N">N</option>
                                    <option value="S">S</option>
                                </>
                            ) : (
                                <>
                                    <option value="E">E</option>
                                    <option value="W">W</option>
                                </>
                            )}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoordinateInput;