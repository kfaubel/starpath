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
  polarisPosition,
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

        // Find the start and end time data points
        const startPoint = positionData[0]; // First point in the time range
        const endPoint = positionData[positionData.length - 1]; // Last point in the time range
        
        if (startPoint && endPoint) {
            // Convert coordinates for label positioning
            const startCoords = math2map(startPoint.az, startPoint.el);
            const endCoords = math2map(endPoint.az, endPoint.el);
            
            // Format time labels
            const formatTime = (hour) => {
              if (hour === 0) return "12 AM";
              if (hour < 12) return hour + " AM";
              if (hour === 12) return "12 PM";
              return (hour - 12) + " PM";
            };
            
            // Enhanced start time label - positioned at actual start coordinates
            g.append("circle")
                .attr("cx", startCoords.x)
                .attr("cy", startCoords.y)
                .attr("r", 6)
                .style("fill", "#ff4444")
                .style("stroke", "#ffffff")
                .style("stroke-width", "2px");
                
            // Background for text (makes it more readable)
            const startLabel = formatTime(startPoint.time);
            const startLabelWidth = startLabel.length * 8 + 10;
            g.append("rect")
                .attr("x", startCoords.x - startLabelWidth/2)
                .attr("y", startCoords.y - 25)
                .attr("width", startLabelWidth)
                .attr("height", 16)
                .attr("rx", 3)
                .style("fill", "rgba(0, 0, 0, 0.8)")
                .style("stroke", "#ff4444")
                .style("stroke-width", "1px");
                
            g.append("text")
                .attr("x", startCoords.x)
                .attr("y", startCoords.y - 12)
                .attr("text-anchor", "middle")
                .style("fill", "#ffffff")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text(startLabel);
                
            // Enhanced end time label - positioned at actual end coordinates
            g.append("circle")
                .attr("cx", endCoords.x)
                .attr("cy", endCoords.y)
                .attr("r", 6)
                .style("fill", "#ff4444")
                .style("stroke", "#ffffff")
                .style("stroke-width", "2px");
                
            // Background for text (makes it more readable)
            const endLabel = formatTime(endPoint.time);
            const endLabelWidth = endLabel.length * 8 + 10;
            g.append("rect")
                .attr("x", endCoords.x - endLabelWidth/2)
                .attr("y", endCoords.y - 25)
                .attr("width", endLabelWidth)
                .attr("height", 16)
                .attr("rx", 3)
                .style("fill", "rgba(0, 0, 0, 0.8)")
                .style("stroke", "#ff4444")
                .style("stroke-width", "1px");
                
            g.append("text")
                .attr("x", endCoords.x)
                .attr("y", endCoords.y - 12)
                .attr("text-anchor", "middle")
                .style("fill", "#ffffff")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text(endLabel);
        }
    }

    // Draw Polaris (the North Star) as a 5-pointed star
    if (polarisPosition && polarisPosition.el >= 0) { // Only draw if above horizon
        const polarisCoords = math2map(polarisPosition.az, polarisPosition.el);
        
        // Function to create 5-pointed star path
        const createStarPath = (cx, cy, size) => {
            const outerRadius = size;
            const innerRadius = size * 0.4;
            let path = '';
            
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5 - Math.PI / 2; // Start from top
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                
                if (i === 0) {
                    path += `M ${x} ${y}`;
                } else {
                    path += ` L ${x} ${y}`;
                }
            }
            path += ' Z'; // Close the path
            return path;
        };
        
        // Draw the 5-pointed star for Polaris
        g.append("path")
            .attr("d", createStarPath(polarisCoords.x, polarisCoords.y, 8))
            .style("fill", "#ffdd44")
            .style("stroke", "#ffffff")
            .style("stroke-width", "1px");
            
        // Add Polaris label
        g.append("text")
            .attr("x", polarisCoords.x)
            .attr("y", polarisCoords.y + 20)
            .attr("text-anchor", "middle")
            .style("fill", "#ffdd44")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
            .text("POLARIS");
    }

  }, [positionData, polarisPosition, width, height]);

  return (
    <div className={`polar-plot ${className}`}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PolarPlot;