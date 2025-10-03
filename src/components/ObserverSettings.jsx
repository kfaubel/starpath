import React from 'react';
import CoordinateInput from './CoordinateInput.jsx';

/**
 * Observer Settings Component  
 * Manages observer location, observation date, and time range settings
 */
const ObserverSettings = ({
    latitudeCoordinates,
    longitudeCoordinates,
    observationDate,
    startTime,
    endTime,
    onLatitudeChange,
    onLongitudeChange,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange
}) => {

    const inputStyle = {
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

    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (e) => {
        if (onDateChange) {
            onDateChange(new Date(e.target.value));
        }
    };

    const handleStartTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 23 && onStartTimeChange) {
            onStartTimeChange(value);
        }
    };

    const handleEndTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 23 && onEndTimeChange) {
            onEndTimeChange(value);
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
                Observer Settings
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* Observer Location Column */}
                <div>
                    <h4 style={{
                        color: '#ffdd44',
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                    }}>
                        Observer Location
                    </h4>

                    <CoordinateInput
                        type="Latitude"
                        values={latitudeCoordinates}
                        onChange={onLatitudeChange}
                        label="Latitude"
                        showInline={false}
                    />

                    <CoordinateInput
                        type="Longitude"
                        values={longitudeCoordinates}
                        onChange={onLongitudeChange}
                        label="Longitude"
                        showInline={false}
                    />
                </div>

                {/* Observation Date and Time Range Column */}
                <div>
                    <h4 style={{
                        color: '#ffdd44',
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                    }}>
                        Observation Date & Time Range
                    </h4>

                    {/* Observation Date */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Observation Date</label>
                        <input
                            type="date"
                            value={formatDateForInput(observationDate)}
                            onChange={handleDateChange}
                            style={{
                                ...inputStyle,
                                width: '200px'
                            }}
                        />
                    </div>

                    {/* Time Range */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={labelStyle}>Start Time (24h)</label>
                            <select
                                value={startTime}
                                onChange={handleStartTimeChange}
                                style={{
                                    ...inputStyle,
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>End Time (24h)</label>
                            <select
                                value={endTime}
                                onChange={handleEndTimeChange}
                                style={{
                                    ...inputStyle,
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '0.5rem',
                        color: '#cccccc',
                        fontSize: '0.8rem',
                        fontStyle: 'italic'
                    }}>
                        Use crossing midnight times (e.g., 19:00 to 06:00) for nighttime observations
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ObserverSettings;