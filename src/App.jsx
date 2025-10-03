import React, { useState, useEffect } from 'react';
import PolarPlot from './components/PolarPlot.jsx';
import { getPositionVectors, getNighttimePositionVectors, generatePositionData, generateNighttimePositionData, generateCustomTimePositionData, generateCustomTimeDates, fireworksCelestial, solCelestial, polarisCelestial, hmsToDeg, dmsToDeg, calculatePositionAtTime, RaDec2AzEl, generateNighttimeDates } from './astronomical.js';

/*
Main App Component
Starpath - Astronomical Sky Path Visualization
*/

function App() {
    // Local storage utility functions
    const saveToLocalStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    };

    const loadFromLocalStorage = (key, defaultValue) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    };

    const [positionData, setPositionData] = useState(null);
    const [observationDate, setObservationDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Celestial coordinates in HMS/DMS format (primary input method) - load from localStorage
    const [raHours, setRaHours] = useState(() => loadFromLocalStorage('starpath_raHours', 20));
    const [raMinutes, setRaMinutes] = useState(() => loadFromLocalStorage('starpath_raMinutes', 35));
    const [raSeconds, setRaSeconds] = useState(() => loadFromLocalStorage('starpath_raSeconds', 25));
    const [decDegrees, setDecDegrees] = useState(() => loadFromLocalStorage('starpath_decDegrees', 60));
    const [decArcminutes, setDecArcminutes] = useState(() => loadFromLocalStorage('starpath_decArcminutes', 14));
    const [decArcseconds, setDecArcseconds] = useState(() => loadFromLocalStorage('starpath_decArcseconds', 47));
    const [objectName, setObjectName] = useState('Fireworks Nebula');

    // Observer coordinates in DMS format (Dunstable, MA by default) - load from localStorage
    const [latDegrees, setLatDegrees] = useState(() => loadFromLocalStorage('starpath_latDegrees', 42));
    const [latArcminutes, setLatArcminutes] = useState(() => loadFromLocalStorage('starpath_latArcminutes', 41));
    const [latArcseconds, setLatArcseconds] = useState(() => loadFromLocalStorage('starpath_latArcseconds', 1));
    const [latDirection, setLatDirection] = useState(() => loadFromLocalStorage('starpath_latDirection', 'N'));
    const [lonDegrees, setLonDegrees] = useState(() => loadFromLocalStorage('starpath_lonDegrees', 71));
    const [lonArcminutes, setLonArcminutes] = useState(() => loadFromLocalStorage('starpath_lonArcminutes', 28));
    const [lonArcseconds, setLonArcseconds] = useState(() => loadFromLocalStorage('starpath_lonArcseconds', 16));
    const [lonDirection, setLonDirection] = useState(() => loadFromLocalStorage('starpath_lonDirection', 'W'));

    // Time range for starpath (24-hour format)
    const [startTime, setStartTime] = useState(18); // 6 PM default
    const [endTime, setEndTime] = useState(6); // 6 AM default

    // Wrapper functions to save coordinates to localStorage when they change
    const updateRaHours = (value) => {
        setRaHours(value);
        saveToLocalStorage('starpath_raHours', value);
    };
    const updateRaMinutes = (value) => {
        setRaMinutes(value);
        saveToLocalStorage('starpath_raMinutes', value);
    };
    const updateRaSeconds = (value) => {
        setRaSeconds(value);
        saveToLocalStorage('starpath_raSeconds', value);
    };
    const updateDecDegrees = (value) => {
        setDecDegrees(value);
        saveToLocalStorage('starpath_decDegrees', value);
    };
    const updateDecArcminutes = (value) => {
        setDecArcminutes(value);
        saveToLocalStorage('starpath_decArcminutes', value);
    };
    const updateDecArcseconds = (value) => {
        setDecArcseconds(value);
        saveToLocalStorage('starpath_decArcseconds', value);
    };
    const updateLatDegrees = (value) => {
        setLatDegrees(value);
        saveToLocalStorage('starpath_latDegrees', value);
    };
    const updateLatArcminutes = (value) => {
        setLatArcminutes(value);
        saveToLocalStorage('starpath_latArcminutes', value);
    };
    const updateLatArcseconds = (value) => {
        setLatArcseconds(value);
        saveToLocalStorage('starpath_latArcseconds', value);
    };
    const updateLatDirection = (value) => {
        setLatDirection(value);
        saveToLocalStorage('starpath_latDirection', value);
    };
    const updateLonDegrees = (value) => {
        setLonDegrees(value);
        saveToLocalStorage('starpath_lonDegrees', value);
    };
    const updateLonArcminutes = (value) => {
        setLonArcminutes(value);
        saveToLocalStorage('starpath_lonArcminutes', value);
    };
    const updateLonArcseconds = (value) => {
        setLonArcseconds(value);
        saveToLocalStorage('starpath_lonArcseconds', value);
    };
    const updateLonDirection = (value) => {
        setLonDirection(value);
        saveToLocalStorage('starpath_lonDirection', value);
    };

    // SIMBAD search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    // Calculate position data when component mounts or parameters change
    useEffect(() => {
        setLoading(true);
        try {
            // Convert HMS/DMS to decimal degrees
            const raDeg = hmsToDeg(raHours, raMinutes, raSeconds);
            const decDeg = dmsToDeg(Math.abs(decDegrees), decArcminutes, decArcseconds) * (decDegrees < 0 ? -1 : 1);

            // Convert observer coordinates to decimal degrees
            const observerLat = dmsToDeg(latDegrees, latArcminutes, latArcseconds) * (latDirection === 'S' ? -1 : 1);
            const observerLon = dmsToDeg(lonDegrees, lonArcminutes, lonArcseconds) * (lonDirection === 'W' ? -1 : 1);

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
    }, [observationDate, raHours, raMinutes, raSeconds, decDegrees, decArcminutes, decArcseconds, latDegrees, latArcminutes, latArcseconds, latDirection, lonDegrees, lonArcminutes, lonArcseconds, lonDirection, startTime, endTime]);

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

    const handleObjectNameChange = (e) => {
        setObjectName(e.target.value);
    };

    // RA input handlers
    const handleRaHoursChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 23) {
            updateRaHours(value);
        }
    };

    const handleRaMinutesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 59) {
            updateRaMinutes(value);
        }
    };

    const handleRaSecondsChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value < 60) {
            updateRaSeconds(value);
        }
    };

    // Dec input handlers
    const handleDecDegreesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= -90 && value <= 90) {
            updateDecDegrees(value);
        }
    };

    const handleDecArcminutesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 59) {
            updateDecArcminutes(value);
        }
    };

    const handleDecArcsecondsChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value < 60) {
            updateDecArcseconds(value);
        }
    };

    // Observer coordinate input handlers
    const handleLatDegreesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 90) {
            updateLatDegrees(value);
        }
    };

    const handleLatArcminutesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 59) {
            updateLatArcminutes(value);
        }
    };

    const handleLatArcsecondsChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value < 60) {
            updateLatArcseconds(value);
        }
    };

    const handleLonDegreesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 180) {
            updateLonDegrees(value);
        }
    };

    const handleLonArcminutesChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 59) {
            updateLonArcminutes(value);
        }
    };

    const handleLonArcsecondsChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value < 60) {
            updateLonArcseconds(value);
        }
    };

    // Time range input handlers
    const handleStartTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 23) {
            setStartTime(value);
        }
    };

    const handleEndTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 23) {
            setEndTime(value);
        }
    };

    // SIMBAD search functionality
    const searchSimbad = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Please enter an object name or identifier');
            return;
        }

        setSearchLoading(true);
        setSearchError('');
        setSearchResults(null);

        try {
            // Use SIMBAD's TAP service to search for the object
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            const tapQuery = `SELECT TOP 1 main_id, ra, dec, otype_txt, sp_type, flux_V 
                        FROM basic 
                        WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ra, dec, 1)) = 1 
                        AND (main_id LIKE '%${searchQuery.trim()}%' OR oid LIKE '%${searchQuery.trim()}%')
                        ORDER BY flux_V`;

            // Alternative: Use the simpler name resolver service
            const simbadUrl = `https://simbad.cds.unistra.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(tapQuery)}`;

            // For CORS issues, we'll use a simpler approach with the name resolver
            const nameResolverUrl = `https://simbad.cds.unistra.fr/simbad/sim-id?output.format=votable&Ident=${encodedQuery}`;

            // Since SIMBAD doesn't support CORS, we'll use a proxy or alternative approach
            // For now, let's create a simple mock that demonstrates the functionality
            // In a real implementation, you'd need a backend proxy or use a CORS-enabled service

            // Mock response for demonstration
            setTimeout(() => {
                // Simulate search results based on common objects
                const mockResults = {
                    'vega': { name: 'Vega', ra: 279.2347, dec: 38.7837, type: 'Variable Star', spectralType: 'A0V' },
                    'sirius': { name: 'Sirius', ra: 101.2871, dec: -16.7161, type: 'Binary Star', spectralType: 'A1V' },
                    'polaris': { name: 'Polaris', ra: 37.9544, dec: 89.2641, type: 'Variable Star', spectralType: 'F7Ib' },
                    'betelgeuse': { name: 'Betelgeuse', ra: 88.7929, dec: 7.4070, type: 'Variable Star', spectralType: 'M2Iab' },
                    'rigel': { name: 'Rigel', ra: 78.6344, dec: -8.2017, type: 'Multiple Star', spectralType: 'B8Ia' },
                    'aldebaran': { name: 'Aldebaran', ra: 68.9801, dec: 16.5093, type: 'Variable Star', spectralType: 'K5III' },
                    'arcturus': { name: 'Arcturus', ra: 213.9153, dec: 19.1824, type: 'Variable Star', spectralType: 'K1.5IIIFe-0.5' },
                    'spica': { name: 'Spica', ra: 201.2983, dec: -11.1614, type: 'Binary Star', spectralType: 'B1V' }
                };

                const queryLower = searchQuery.toLowerCase().trim();
                const result = mockResults[queryLower];

                if (result) {
                    // Convert decimal degrees to HMS/DMS
                    const raHours = Math.floor(result.ra / 15);
                    const raMinutes = Math.floor((result.ra / 15 - raHours) * 60);
                    const raSeconds = ((result.ra / 15 - raHours) * 60 - raMinutes) * 60;

                    const decSign = result.dec >= 0 ? 1 : -1;
                    const absDecDeg = Math.abs(result.dec);
                    const decDeg = Math.floor(absDecDeg) * decSign;
                    const decMin = Math.floor((absDecDeg - Math.floor(absDecDeg)) * 60);
                    const decSec = ((absDecDeg - Math.floor(absDecDeg)) * 60 - decMin) * 60;

                    setSearchResults({
                        name: result.name,
                        type: result.type,
                        spectralType: result.spectralType,
                        ra: result.ra,
                        dec: result.dec,
                        raHms: { h: raHours, m: raMinutes, s: raSeconds },
                        decDms: { d: decDeg, m: decMin, s: decSec }
                    });
                    setSearchLoading(false);
                } else {
                    setSearchError(`Object "${searchQuery}" not found in database. Try: vega, sirius, polaris, betelgeuse, rigel, aldebaran, arcturus, or spica.`);
                    setSearchLoading(false);
                }
            }, 1000); // Simulate network delay

        } catch (error) {
            setSearchError(`Search failed: ${error.message}`);
            setSearchLoading(false);
        }
    };

    const useSearchResults = () => {
        if (searchResults) {
            updateRaHours(Math.floor(searchResults.raHms.h));
            updateRaMinutes(Math.floor(searchResults.raHms.m));
            updateRaSeconds(Math.round(searchResults.raHms.s * 100) / 100);
            updateDecDegrees(Math.floor(searchResults.decDms.d));
            updateDecArcminutes(Math.floor(searchResults.decDms.m));
            updateDecArcseconds(Math.round(searchResults.decDms.s * 100) / 100);
            setObjectName(searchResults.name);
            setSearchResults(null); // Clear search results
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
                    Visualizing the path of celestial objects across the night sky<br />
                </p>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f22d7fff' }}>This is still very much a work in progress.</h3>
            </header>

            <main>
                {/* Control Panel */}
                <div style={{
                    padding: '2rem',
                    background: 'rgba(30, 42, 74, 0.8)',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '2rem',
                    alignItems: 'flex-start'
                }}>

                    {/* ASTRONOMICAL OBJECT SECTION */}
                    <div style={{
                        background: 'rgba(20, 30, 50, 0.9)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(68, 85, 119, 0.6)',
                        flex: '1'
                    }}>
                        
                        {/* Combined SIMBAD Search and Coordinates */}
                        <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: '#ffdd44' }}>SIMBAD Search & Coordinates</h3>

                            {/* SIMBAD Search */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        id="simbad-search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchSimbad()}
                                        placeholder="e.g., Vega, Sirius, M31..."
                                        disabled={searchLoading}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid #555',
                                            background: '#2a3a5a',
                                            color: '#ffffff'
                                        }}
                                    />
                                    <button
                                        onClick={searchSimbad}
                                        disabled={searchLoading}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: '1px solid #555',
                                            background: searchLoading ? '#555' : '#4a6fa5',
                                            color: '#ffffff',
                                            cursor: searchLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {searchLoading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            {searchResults && (
                                <div style={{
                                    background: 'rgba(76, 175, 80, 0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #4CAF50'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4CAF50' }}>Found: {searchResults.name}</h4>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#cccccc' }}>
                                        Type: {searchResults.type}
                                        {searchResults.spectralType && ` | Spectral Type: ${searchResults.spectralType}`}
                                    </p>
                                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#aaaaaa' }}>
                                        RA: {Math.floor(searchResults.raHms.h)}h {Math.floor(searchResults.raHms.m)}m {searchResults.raHms.s.toFixed(1)}s<br />
                                        Dec: {Math.floor(searchResults.decDms.d)}° {Math.floor(searchResults.decDms.m)}' {searchResults.decDms.s.toFixed(1)}"
                                    </p>
                                    <button
                                        onClick={useSearchResults}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: '1px solid #4CAF50',
                                            background: '#4CAF50',
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Use These Coordinates
                                    </button>
                                </div>
                            )}

                            {/* Search Error */}
                            {searchError && (
                                <div style={{
                                    background: 'rgba(244, 67, 54, 0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #f44336'
                                }}>
                                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#f44336' }}>
                                        {searchError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '2rem',
                            background: 'rgba(30, 42, 74, 0.8)',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '2rem',
                            alignItems: 'flex-start'
                        }}>
                            {/* Right Ascension Input */}
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Right Ascension (RA)</h4>
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                            Hours
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
                                            Minutes
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
                                            Seconds
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
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Declination (Dec)</h4>
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                            Degrees
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
                                            Arcmin
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
                                        <label style={{ display: 'block', marginBox: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                            Arcsec
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
                        </div>
                    </div>

                    {/* OBSERVER SETTINGS SECTION */}
                    <div style={{
                        background: 'rgba(20, 30, 50, 0.9)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(68, 85, 119, 0.6)',
                        flex: '1'
                    }}>
                        {/* Combined Observer Settings */}
                        <div style={{ background: 'rgba(68, 85, 119, 0.4)', padding: '1rem', borderRadius: '8px' }}>

                            {/* Observer Location */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#ffdd44' }}>Observer Location and Date</h3>
                            </div>
                        </div>
                        <div style={{
                            padding: '2rem',
                            background: 'rgba(30, 42, 74, 0.8)',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '2rem',
                            alignItems: 'flex-start'
                        }}>
                            <div> 

                                {/* Latitude Input */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Latitude</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                                Degrees
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="90"
                                                value={latDegrees}
                                                onChange={handleLatDegreesChange}
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
                                                Arcmin
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={latArcminutes}
                                                onChange={handleLatArcminutesChange}
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
                                                Arcsec
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59.99"
                                                step="0.01"
                                                value={latArcseconds}
                                                onChange={handleLatArcsecondsChange}
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
                                                Direction
                                            </label>
                                            <select
                                                value={latDirection}
                                                onChange={(e) => updateLatDirection(e.target.value)}
                                                style={{
                                                    width: '60px',
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #555',
                                                    background: '#2a3a5a',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                <option value="N">N</option>
                                                <option value="S">S</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Longitude Input */}
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Longitude</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                                Degrees
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="180"
                                                value={lonDegrees}
                                                onChange={handleLonDegreesChange}
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
                                                Arcmin
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={lonArcminutes}
                                                onChange={handleLonArcminutesChange}
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
                                                Arcsec
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59.99"
                                                step="0.01"
                                                value={lonArcseconds}
                                                onChange={handleLonArcsecondsChange}
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
                                                Direction
                                            </label>
                                            <select
                                                value={lonDirection}
                                                onChange={(e) => updateLonDirection(e.target.value)}
                                                style={{
                                                    width: '60px',
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #555',
                                                    background: '#2a3a5a',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                <option value="E">E</option>
                                                <option value="W">W</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>

                                {/* Observation Date */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Observation Date</h4>
                                    <label htmlFor="date-input" style={{ display: 'block', marginBottom: '0.3rem', color: '#cccccc' }}>
                                        Date:
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

                                {/* Time Range */}
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffdd44', fontSize: '1rem' }}>Time Range</h4>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                                Start Time
                                            </label>
                                            <select
                                                value={startTime}
                                                onChange={handleStartTimeChange}
                                                style={{
                                                    width: '120px',
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #555',
                                                    background: '#2a3a5a',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {i === 0 ? '12 AM' :
                                                            i < 12 ? i + ' AM' :
                                                                i === 12 ? '12 PM' :
                                                                    (i - 12) + ' PM'} ({i.toString().padStart(2, '0')}:00)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ color: '#ffdd44', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            to
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc', fontSize: '0.9rem' }}>
                                                End Time
                                            </label>
                                            <select
                                                value={endTime}
                                                onChange={handleEndTimeChange}
                                                style={{
                                                    width: '120px',
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #555',
                                                    background: '#2a3a5a',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {i === 0 ? '12 AM' :
                                                            i < 12 ? i + ' AM' :
                                                                i === 12 ? '12 PM' :
                                                                    (i - 12) + ' PM'} ({i.toString().padStart(2, '0')}:00)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VISUALIZATION SECTION */}
                <div>
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
                                polarisPosition={positionData?.polaris}
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
                </div>
                <div>
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
                                <h3 style={{ color: '#ff4444', marginBottom: '0.5rem' }}>Red Line & Labels</h3>
                                <p style={{ color: '#cccccc', margin: 0 }}>
                                    Shows the path of the celestial object during specified time range. 
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
            </main>
        </div>
    );
}

export default App;