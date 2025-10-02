## Overview
This project was generated from the code in the blog post "Drawing Star Paths with D3.js" at https://www.karllhughes.com/blog/drawing-star-paths-with-d3-js/

Origina source code is from: https://github.com/fasiha/starpath

## Running the Code
To run the code, simply open `index.html` in a web browser. No additional setup is required.

## Files
- `index.html`: The main HTML file containing the D3.js code to visualize star paths.
- `Readme.md`: This readme file with instructions and overview.
- `data.js`: A JavaScript file containing the star position data used in the visualization.
- `styles.css`: A CSS file for styling the visualization.
## Dependencies
- D3.js library (included via CDN in `index.html`)
- A modern web browser to view the visualization.

## Deployment
- Run: npm install gh-pages --save-dev
- Add to package.json:
  "homepage": "http://<your-github-username>.github.io/<repository-name>",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
- Update vite.config.js to set build.outDir to 'build'
- Run: npm run deploy
- Ensure GitHub Pages is enabled in the repository settings, pointing to the 'gh-pages' branch.
- Ensure the repository is public.
- Visit: http://<your-github-username>.github.io/<repository-name>

