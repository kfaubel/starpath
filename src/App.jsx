import React, { useState, useEffect } from 'react';
import PolarPlot from './components/PolarPlot.jsx';
import AstronomicalObjectSettings from './components/AstronomicalObjectSettings.jsx';
import ObserverSettings from './components/ObserverSettings.jsx';
import { useLocalStorageGroup } from './hooks/useLocalStorage.js';
import { 
    generateCustomTimeDates, 
    polarisCelestial, 
    hmsToDeg, 
    dmsToDeg, 
    RaDec2AzEl 
} from './astronomical.js';

/*
Main App Component
Starpath - Astronomical Sky Path Visualization
Refactored with component separation for better maintainability
*/

function App() {
    // Core application state
    const [positionData, setPositionData] = useState(null);
    const [observationDate, setObservationDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [objectName, setObjectName] = useState('Fireworks Nebula');

    // Coordinate state managed with localStorage
    const { values: coords, setters: setCoords } = useLocalStorageGroup('starpath_', {
        raHours: 20,
        raMinutes: 35,
        raSeconds: 25,
        decDegrees: 60,
        decArcminutes: 14,
        decArcseconds: 47,
        latDegrees: 42,
        latArcminutes: 41,
        latArcseconds: 1,
        latDirection: 'N',
        lonDegrees: 71,
        lonArcminutes: 28,
        lonArcseconds: 16,
        lonDirection: 'W'
    });

    // Time range state
    const [startTime, setStartTime] = useState(18); // 6 PM default
    const [endTime, setEndTime] = useState(6); // 6 AM default

    // Coordinate change handlers
    const handleRaChange = (newValues) => {
        setCoords.raHours(newValues.primary);
        setCoords.raMinutes(newValues.secondary);
        setCoords.raSeconds(newValues.tertiary);
    };

    const handleDecChange = (newValues) => {
        setCoords.decDegrees(newValues.primary);
        setCoords.decArcminutes(newValues.secondary);
        setCoords.decArcseconds(newValues.tertiary);
    };

    const handleLatitudeChange = (newValues) => {
        setCoords.latDegrees(newValues.primary);
        setCoords.latArcminutes(newValues.secondary);
        setCoords.latArcseconds(newValues.tertiary);
        setCoords.latDirection(newValues.direction);
    };

    const handleLongitudeChange = (newValues) => {
        setCoords.lonDegrees(newValues.primary);
        setCoords.lonArcminutes(newValues.secondary);
        setCoords.lonArcseconds(newValues.tertiary);
        setCoords.lonDirection(newValues.direction);
    };

    const handleSimbadResult = (searchResult) => {
        setObjectName(searchResult.name);
    };

    // Calculate position data when component mounts or parameters change
    useEffect(() => {
        setLoading(true);
        try {
            // Convert HMS/DMS to decimal degrees
            const raDeg = hmsToDeg(coords.raHours, coords.raMinutes, coords.raSeconds);
            const decDeg = dmsToDeg(
                Math.abs(coords.decDegrees), 
                coords.decArcminutes, 
                coords.decArcseconds
            ) * (coords.decDegrees < 0 ? -1 : 1);

            // Convert observer coordinates to decimal degrees
            const observerLat = dmsToDeg(
                coords.latDegrees, 
                coords.latArcminutes, 
                coords.latArcseconds
            ) * (coords.latDirection === 'S' ? -1 : 1);
            
            const observerLon = dmsToDeg(
                coords.lonDegrees, 
                coords.lonArcminutes, 
                coords.lonArcseconds
            ) * (coords.lonDirection === 'W' ? -1 : 1);

            // Custom position calculation function using user's observer coordinates
            const calculateCustomPosition = (date, celestialObj) =>
                RaDec2AzEl(celestialObj.ra, celestialObj.dec, observerLat, observerLon, date);

            // Generate custom time range dates and calculate positions for each
            const dateVec = generateCustomTimeDates(observationDate, startTime, endTime);
            const currentObject = dateVec.map(date => ({
                ...calculateCustomPosition(date, { ra: raDeg, dec: decDeg }),
                time: date.getHours() // Store the hour for labeling
            }));

            // Calculate Polaris position using custom observer coordinates
            const polarisPosition = calculateCustomPosition(observationDate, polarisCelestial);

            setPositionData({
                current: currentObject,
                polaris: polarisPosition
            });
        } catch (error) {
            console.error('Error calculating positions:', error);
        } finally {
            setLoading(false);
        }
    }, [
        coords.raHours, coords.raMinutes, coords.raSeconds,
        coords.decDegrees, coords.decArcminutes, coords.decArcseconds,
        coords.latDegrees, coords.latArcminutes, coords.latArcseconds, coords.latDirection,
        coords.lonDegrees, coords.lonArcminutes, coords.lonArcseconds, coords.lonDirection,
        observationDate, startTime, endTime
    ]);

    const currentObjectData = positionData?.current;

    return (
        <div className="App">
            <style>{`
                body {
                    background: linear-gradient(135deg, #0c1445 0%, #1a1a2e 50%, #16213e 100%);
                    min-height: 100vh;
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
            `}</style>

            <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <h1 style={{
                        textAlign: 'center',
                        color: '#ffdd44',
                        marginBottom: '2rem',
                        fontSize: '2.5rem',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                        Starpath
                    </h1>

                    {/* Settings Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Astronomical Object Settings */}
                        <AstronomicalObjectSettings
                            raCoordinates={{
                                primary: coords.raHours,
                                secondary: coords.raMinutes,
                                tertiary: coords.raSeconds
                            }}
                            decCoordinates={{
                                primary: coords.decDegrees,
                                secondary: coords.decArcminutes,
                                tertiary: coords.decArcseconds
                            }}
                            onRaChange={handleRaChange}
                            onDecChange={handleDecChange}
                            onSimbadResult={handleSimbadResult}
                        />

                        {/* Observer Settings */}
                        <ObserverSettings
                            latitudeCoordinates={{
                                primary: coords.latDegrees,
                                secondary: coords.latArcminutes,
                                tertiary: coords.latArcseconds,
                                direction: coords.latDirection
                            }}
                            longitudeCoordinates={{
                                primary: coords.lonDegrees,
                                secondary: coords.lonArcminutes,
                                tertiary: coords.lonArcseconds,
                                direction: coords.lonDirection
                            }}
                            observationDate={observationDate}
                            startTime={startTime}
                            endTime={endTime}
                            onLatitudeChange={handleLatitudeChange}
                            onLongitudeChange={handleLongitudeChange}
                            onDateChange={setObservationDate}
                            onStartTimeChange={setStartTime}
                            onEndTimeChange={setEndTime}
                        />
                    </div>

                    {/* Visualization Section */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ 
                            color: '#ffdd44', 
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem'
                        }}>
                            Sky Path Visualization
                        </h2>
                        
                        {loading ? (
                            <div style={{
                                color: '#cccccc',
                                fontSize: '1.2rem',
                                textAlign: 'center'
                            }}>
                                Calculating celestial positions...
                            </div>
                        ) : currentObjectData ? (
                            <PolarPlot
                                positionData={currentObjectData}
                                polarisPosition={positionData?.polaris}
                                width={1024}
                                height={640}
                            />
                        ) : (
                            <div style={{
                                color: '#ff6666',
                                fontSize: '1.1rem',
                                textAlign: 'center'
                            }}>
                                No position data available
                            </div>
                        )}
                    </div>

                    {/* Help Section */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: '#ffdd44', marginBottom: '1rem' }}>How to Use</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}>
                            <div>
                                <h3 style={{ color: '#ff4444', marginBottom: '0.5rem' }}>Red Line & Labels</h3>
                                <p style={{ color: '#cccccc', margin: 0 }}>
                                    Shows the path of the celestial object during the specified time range.
                                    Red dots and labels mark the start and end times of the observation period.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ color: '#666666', marginBottom: '0.5rem' }}>Circles</h3>
                                <p style={{ color: '#cccccc', margin: 0 }}>
                                    Represent elevation angles: center = 90° (zenith), edge = 0° (horizon)
                                </p>
                            </div>
                            <div>
                                <h3 style={{ color: '#888888', marginBottom: '0.5rem' }}>Compass Labels</h3>
                                <p style={{ color: '#cccccc', margin: 0 }}>
                                    Show cardinal and intercardinal directions (N, NE, E, SE, etc.)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attribution Section */}
                    <div style={{
                        marginTop: '3rem',
                        padding: '2rem',
                        borderTop: '2px solid #333333',
                        textAlign: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ 
                            color: '#ffdd44', 
                            marginBottom: '1rem',
                            fontSize: '1.2rem'
                        }}>
                            Attribution
                        </h3>
                        <p style={{ 
                            color: '#cccccc', 
                            margin: '0.5rem 0',
                            fontSize: '1rem'
                        }}>
                            This application is based on the original work by{' '}
                            <strong style={{ color: '#ffdd44' }}>Ahmed Fasih</strong>
                        </p>
                        <p style={{ 
                            color: '#cccccc', 
                            margin: '0.5rem 0',
                            fontSize: '0.9rem'
                        }}>
                            Original repository:{' '}
                            <a 
                                href="https://github.com/fasiha/starpath" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    color: '#4A9EFF',
                                    textDecoration: 'none'
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                                github.com/fasiha/starpath
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;