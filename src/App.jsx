import React, { useState, useEffect } from 'react';
import PolarPlot from './components/PolarPlot.jsx';
import { getPositionVectors, generatePositionData, fireworksCelestial, solCelestial, hmsToDeg, dmsToDeg } from './astronomical.js';

/*
Main App Component
Starpath - Astronomical Sky Path Visualization
*/

function App() {
  const [positionData, setPositionData] = useState(null);
  const [selectedObject, setSelectedObject] = useState('fireworks');
  const [observationDate, setObservationDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Celestial coordinates in HMS/DMS format (primary input method)
  const [raHours, setRaHours] = useState(20);
  const [raMinutes, setRaMinutes] = useState(35);
  const [raSeconds, setRaSeconds] = useState(25);
  const [decDegrees, setDecDegrees] = useState(60);
  const [decArcminutes, setDecArcminutes] = useState(14);
  const [decArcseconds, setDecArcseconds] = useState(47);
  const [objectName, setObjectName] = useState('Fireworks Nebula');
  
  // Preset coordinates
  const presetObjects = {
    fireworks: { name: 'Fireworks Nebula (NGC 6302)', raH: 20, raM: 35, raS: 25, decD: 60, decM: 14, decS: 47 },
    sol: { name: 'The Sun (example position)', raH: 13, raM: 42, raS: 32, decD: -10, decM: 59, decS: 55 },
    vega: { name: 'Vega (Alpha Lyrae)', raH: 18, raM: 36, raS: 56, decD: 38, decM: 47, decS: 1 },
    sirius: { name: 'Sirius (Alpha Canis Majoris)', raH: 6, raM: 45, raS: 9, decD: -16, decM: 42, decS: 58 },
    polaris: { name: 'Polaris (North Star)', raH: 2, raM: 31, raS: 49, decD: 89, decM: 15, decS: 51 }
  };

  // Calculate position data when component mounts or parameters change
  useEffect(() => {
    setLoading(true);
    try {
      // Convert HMS/DMS to decimal degrees
      const raDeg = hmsToDeg(raHours, raMinutes, raSeconds);
      const decDeg = dmsToDeg(Math.abs(decDegrees), decArcminutes, decArcseconds) * (decDegrees < 0 ? -1 : 1);
      
      // Generate position data for current coordinates
      const currentObject = generatePositionData({ ra: raDeg, dec: decDeg }, observationDate);
      setPositionData({ current: currentObject });
    } catch (error) {
      console.error('Error calculating positions:', error);
    } finally {
      setLoading(false);
    }
  }, [observationDate, raHours, raMinutes, raSeconds, decDegrees, decArcminutes, decArcseconds]);

  // Get the current object's data
  const currentObjectData = positionData ? positionData.current : null;

  // Current object information for display
  const getCurrentObjectInfo = () => {
    const raStr = `${raHours}h ${raMinutes}m ${raSeconds}s`;
    const decStr = `${decDegrees}° ${decArcminutes}' ${decArcseconds}"`;
    return {
      name: objectName,
      description: 'Celestial object path visualization',
      coordinates: `RA: ${raStr}, Dec: ${decStr}`
    };
  };

  const handleDateChange = (e) => {
    setObservationDate(new Date(e.target.value));
  };

  const handlePresetChange = (e) => {
    const presetKey = e.target.value;
    if (presetKey && presetObjects[presetKey]) {
      const preset = presetObjects[presetKey];
      setRaHours(preset.raH);
      setRaMinutes(preset.raM);
      setRaSeconds(preset.raS);
      setDecDegrees(preset.decD);
      setDecArcminutes(preset.decM);
      setDecArcseconds(preset.decS);
      setObjectName(preset.name);
      setSelectedObject(presetKey);
    }
  };

  const handleObjectNameChange = (e) => {
    setObjectName(e.target.value);
  };

  // RA input handlers
  const handleRaHoursChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 23) {
      setRaHours(value);
    }
  };

  const handleRaMinutesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 59) {
      setRaMinutes(value);
    }
  };

  const handleRaSecondsChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setRaSeconds(value);
    }
  };

  // Dec input handlers
  const handleDecDegreesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= -90 && value <= 90) {
      setDecDegrees(value);
    }
  };

  const handleDecArcminutesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 59) {
      setDecArcminutes(value);
    }
  };

  const handleDecArcsecondsChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setDecArcseconds(value);
    }
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">Starpath</h1>
        <p className="app-subtitle">
          Visualizing celestial object paths across the sky from Dunstable, Massachusetts
        </p>
      </header>

      <main>
        {/* Control Panel */}
        <div style={{ 
          padding: '2rem', 
          background: 'rgba(30, 42, 74, 0.8)', 
          borderBottom: '1px solid #333',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          
          {/* Preset Objects */}
          <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff' }}>Quick Select</h3>
            <div>
              <label htmlFor="preset-select" style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
                Preset Objects:
              </label>
              <select 
                id="preset-select"
                value={selectedObject} 
                onChange={handlePresetChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: '#2a3a5a',
                  color: '#ffffff'
                }}
              >
                <option value="">Custom coordinates...</option>
                <option value="fireworks">Fireworks Nebula (NGC 6302)</option>
                <option value="vega">Vega (Alpha Lyrae)</option>
                <option value="sirius">Sirius (Alpha Canis Majoris)</option>
                <option value="polaris">Polaris (North Star)</option>
                <option value="sol">The Sun (example position)</option>
              </select>
            </div>
          </div>

          {/* Object Name and Date */}
          <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff' }}>Object & Date</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="object-name" style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
                Object Name:
              </label>
              <input
                id="object-name"
                type="text"
                value={objectName}
                onChange={handleObjectNameChange}
                placeholder="Enter object name"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: '#2a3a5a',
                  color: '#ffffff'
                }}
              />
            </div>
            <div>
              <label htmlFor="date-input" style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
                Observation Date:
              </label>
              <input
                id="date-input"
                type="date"
                value={formatDateForInput(observationDate)}
                onChange={handleDateChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: '#2a3a5a',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Right Ascension Input */}
          <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff' }}>Right Ascension (RA)</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Hours (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={raHours}
                  onChange={handleRaHoursChange}
                  style={{
                    width: '70px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Minutes (0-59)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={raMinutes}
                  onChange={handleRaMinutesChange}
                  style={{
                    width: '70px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Seconds (0-60)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59.99"
                  step="0.01"
                  value={raSeconds}
                  onChange={handleRaSecondsChange}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Declination Input */}
          <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff' }}>Declination (Dec)</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Degrees (±90)
                </label>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  value={decDegrees}
                  onChange={handleDecDegreesChange}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Arcmin (0-59)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={decArcminutes}
                  onChange={handleDecArcminutesChange}
                  style={{
                    width: '70px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                  Arcsec (0-60)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59.99"
                  step="0.01"
                  value={decArcseconds}
                  onChange={handleDecArcsecondsChange}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#2a3a5a',
                    color: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Current Object Info */}
          <div style={{ 
            background: 'rgba(68, 85, 119, 0.6)', 
            padding: '1rem', 
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              {getCurrentObjectInfo().name}
            </h3>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#cccccc' }}>
              {getCurrentObjectInfo().description}
            </p>
            <p style={{ margin: '0', fontSize: '0.8rem', color: '#aaaaaa' }}>
              {getCurrentObjectInfo().coordinates}
            </p>
          </div>
        </div>

        {/* Visualization */}
        <div className="polar-plot-container">
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
              width={1024}
              height={640}
            />
          ) : (
            <div style={{ 
              color: '#ff6666', 
              fontSize: '1.2rem',
              textAlign: 'center'
            }}>
              Error: Unable to calculate positions
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: '2rem', 
          background: 'rgba(15, 20, 35, 0.8)', 
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>How to Read This Chart</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <h3 style={{ color: '#ff4444', marginBottom: '0.5rem' }}>Red Line</h3>
              <p style={{ color: '#cccccc', margin: 0 }}>
                Shows the path of the selected celestial object across the sky over 24 hours
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
      </main>
    </div>
  );
}

export default App;