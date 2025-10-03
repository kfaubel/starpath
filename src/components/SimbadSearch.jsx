import React, { useState } from 'react';

// Mock SIMBAD database for astronomical objects
const simbadData = {
    'fireworks nebula': { name: 'Fireworks Nebula', raHms: { h: 20, m: 35, s: 25.0 }, decDms: { d: 60, m: 14, s: 47.0 } },
    'ngc 6946': { name: 'NGC 6946 (Fireworks Nebula)', raHms: { h: 20, m: 35, s: 25.0 }, decDms: { d: 60, m: 14, s: 47.0 } },
    'vega': { name: 'Vega', raHms: { h: 18, m: 36, s: 56.3 }, decDms: { d: 38, m: 47, s: 1.0 } },
    'betelgeuse': { name: 'Betelgeuse', raHms: { h: 5, m: 55, s: 10.3 }, decDms: { d: 7, m: 24, s: 25.0 } },
    'rigel': { name: 'Rigel', raHms: { h: 5, m: 14, s: 32.3 }, decDms: { d: -8, m: 12, s: 6.0 } },
    'sirius': { name: 'Sirius', raHms: { h: 6, m: 45, s: 8.9 }, decDms: { d: -16, m: 42, s: 58.0 } },
    'andromeda galaxy': { name: 'Andromeda Galaxy (M31)', raHms: { h: 0, m: 42, s: 44.3 }, decDms: { d: 41, m: 16, s: 9.0 } },
    'm31': { name: 'Andromeda Galaxy (M31)', raHms: { h: 0, m: 42, s: 44.3 }, decDms: { d: 41, m: 16, s: 9.0 } },
    'orion nebula': { name: 'Orion Nebula (M42)', raHms: { h: 5, m: 35, s: 17.3 }, decDms: { d: -5, m: 23, s: 14.0 } },
    'm42': { name: 'Orion Nebula (M42)', raHms: { h: 5, m: 35, s: 17.3 }, decDms: { d: -5, m: 23, s: 14.0 } }
};

/**
 * SIMBAD search component for astronomical objects
 * @param {function} onResultSelect - Callback when user selects search results
 * @param {boolean} loading - External loading state
 * @param {string} error - External error state  
 */
const SimbadSearch = ({ onResultSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    const searchSimbad = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Please enter an object name to search');
            return;
        }
        
        setSearchLoading(true);
        setSearchError('');
        setSearchResults(null);
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = simbadData[searchQuery.toLowerCase()];
            if (result) {
                setSearchResults(result);
                setSearchError('');
            } else {
                setSearchError(`Object "${searchQuery}" not found in database`);
            }
        } catch (error) {
            setSearchError('Failed to search SIMBAD database');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchSimbad();
        }
    };

    const useSearchResults = () => {
        if (searchResults && onResultSelect) {
            onResultSelect(searchResults);
            setSearchResults(null); // Clear search results after use
            setSearchQuery(''); // Clear search query
        }
    };

    const buttonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold'
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Enter object name (e.g., 'Vega', 'M31', 'Orion Nebula')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={searchLoading}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '2px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        fontSize: '1rem'
                    }}
                />
                <button
                    onClick={searchSimbad}
                    disabled={searchLoading || !searchQuery.trim()}
                    style={{
                        ...buttonStyle,
                        backgroundColor: searchLoading ? '#666' : '#4A9EFF',
                        color: '#ffffff'
                    }}
                >
                    {searchLoading ? 'Searching...' : 'Search SIMBAD'}
                </button>
            </div>

            {searchError && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 102, 102, 0.1)',
                    border: '1px solid #ff6666',
                    borderRadius: '4px',
                    color: '#ff6666',
                    fontSize: '0.9rem'
                }}>
                    {searchError}
                </div>
            )}

            {searchResults && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(74, 158, 255, 0.1)',
                    border: '2px solid #4A9EFF',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ 
                                margin: '0 0 0.5rem 0', 
                                color: '#4A9EFF',
                                fontSize: '1.1rem' 
                            }}>
                                Found: {searchResults.name}
                            </h4>
                            <div style={{ 
                                color: '#cccccc', 
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                RA: {Math.floor(searchResults.raHms.h)}h {Math.floor(searchResults.raHms.m)}m {searchResults.raHms.s.toFixed(1)}s<br />
                                Dec: {Math.floor(searchResults.decDms.d)}° {Math.floor(searchResults.decDms.m)}' {searchResults.decDms.s.toFixed(1)}"
                            </div>
                        </div>
                        <button
                            onClick={useSearchResults}
                            style={{
                                ...buttonStyle,
                                backgroundColor: '#28a745',
                                color: '#ffffff'
                            }}
                        >
                            Use These Coordinates
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimbadSearch;