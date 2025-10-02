import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { range } from 'lodash';

/*
PolarPlot React Component
Renders an astronomical polar coordinate plot using D3.js
Shows the paths of celestial objects across the sky over time
*/

const PolarPlot = ({ 
  positionData, 
  width = 1024, 
  height = 640, 
  className = '' 
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!positionData || positionData.length === 0) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the dimensions of the polar plot
    const radius = Math.min(width, height) / 2 - 60;  // Polar plot radius (with margin)

    // Create scale for elevation: 0°(horizon) = outer edge, 90°(zenith) = center
    const r = d3.scaleLinear()
        .domain([0, 90])        // Input: elevation in degrees
        .range([radius, 0]);    // Output: distance from center (inverted)

    // Conversion factor from degrees to radians
    const RADPERDEG = Math.PI / 180;

    // Convert astronomical data (azimuth, elevation) to format needed by D3's radial line
    // Input: array of objects with {az: azimuth_degrees, el: elevation_degrees}
    // Output: array of [azimuth_radians, elevation_degrees] for D3
    const objToDataVec = (data) => data.map(({az, el}) => [ az * RADPERDEG, el ]);

    // Create D3 radial line generator for drawing celestial paths
    const line = d3.line()
        .x(d => r(d[1]) * Math.cos(d[0] - Math.PI/2))  // Convert to Cartesian
        .y(d => r(d[1]) * Math.sin(d[0] - Math.PI/2))  // Rotate so North is up
        .curve(d3.curveCardinal);

    // Create the main SVG element and center it
    const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create elevation grid circles (concentric circles for different elevation angles)
    const elevationTicks = r.ticks(7).slice(0, -1); // Create 6 circles (exclude outermost tick)
    
    const gr = g.append("g")
                 .attr("class", "r axis")
                 .selectAll("g")
                 .data(elevationTicks)
                 .enter()
                 .append("g");

    // Draw the elevation circles
    gr.append("circle")
        .attr("r", r);  // Radius based on elevation angle

    // Add elevation angle labels (0°, 15°, 30°, 45°, 60°, 75°)
    gr.append("text")
        .attr("y", d => -r(d) - 4)  // Position just outside each circle
        .attr("transform", "rotate(15)")               // Slight rotation for better readability
        .style("text-anchor", "middle")
        .text(d => d + "°");              // Display elevation angle in degrees

    // Create azimuth (compass direction) lines radiating from center
    const azimuthAngles = range(0, 360, 45/2); // Every 22.5 degrees (16 directions total)
    
    const ga = g.append("g")
        .attr("class", "a axis")
        .selectAll("g")
        .data(azimuthAngles)
        .enter().append("g")
        .attr("transform", d => `rotate(${-d})`);  // Standard orientation: N=top, S=bottom, E=left, W=right

    // Draw radial lines from center to edge for each compass direction
    ga.append("line")
        .attr("x2", radius);  // Line from center (0,0) to radius distance

    // Convert mathematical coordinates to map coordinates (correct astronomical orientation)  
    // Math coordinates: 0°=East, 90°=North, 180°=West, 270°=South
    // Desired visual: North=top(0°), East=left(90°), South=bottom(180°), West=right(270°)
    const math2map = (mathDeg) => {
        // Convert math coords to visual coords: rotate 90° counterclockwise
        return (mathDeg + 90) % 360;
    };

    // Utility function to ensure degrees are in 0-360 range
    const normalizeDegrees = d => d >= 0 && d <= 360 ? d : d >= 360 ? d % 360 : 360 + d % 360;

    // Mapping of degrees to compass direction abbreviations (every 22.5°)
    const directions = ['S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE' 
                       ];
    
    const threeLetterDirections = {};
    range(0, 360, 45 / 2).forEach((deg, i) => {
        threeLetterDirections[deg] = directions[i];
    });

    // Get compass direction abbreviation for exact degree values, empty string otherwise
    const degreesToDirection = d => d % (45 / 2) === 0 ? threeLetterDirections[d] : "";

    // Add compass direction labels around the perimeter
    ga.append("text")
        .attr("x", radius + 6)  // Position just outside the circle
        .attr("dy", ".35em")    // Vertical alignment
        // Flip text orientation for labels on the left side (180°-360°) for readability
        .style("text-anchor", d => d < 270 && d > 90 ? "end" : null)
        .style("font-size", "14px")  // Larger font size
        .style("font-weight", "bold")  // Make text bolder for better visibility
        .attr("transform", d => d < 270 && d > 90 ? `rotate(180 ${radius + 6} 0)` : null)
        .text(d => {
            // Convert from math coordinates to compass coordinates and show only direction labels
            const compassDeg = normalizeDegrees(Math.round(math2map(d) * 10) / 10);
            return degreesToDirection(compassDeg);  // e.g., "N", "NE", etc. (no degrees)
        });

    // Draw the path of the celestial object across the sky over time
    if (positionData && positionData.length > 0) {
        g.append("path")
            .datum(objToDataVec(positionData))  // Convert to D3 format
            .attr("class", "line")              // Apply red styling
            .attr("d", line)                    // Draw the path
            .style("fill", "none")
            .style("stroke", "#ff4444")
            .style("stroke-width", "2px");
    }

  }, [positionData, width, height]);

  return (
    <div className={`polar-plot ${className}`}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PolarPlot;