### mapbox_challenge
## About
This is a web-based application optimized for desktop (chrome). The tool is designed to analyze the largest connected orthogonal grid (5×5 square meters by default) can fit within a given polygon geometry, whether convex or concave. The primary use case is to evaluate spatial coverage within a defined site boundary.

The core algorithms used include:
- Gift-Wrapping Algorithm: For generating the convex hull of concave geometries.
- Rotating-Calipers: Used to compute the minimum bounding box around a polygon.
- Ray-Casting: To determine whether each grid point lies inside the polygon.

## How To
# Installation
- Backend
`cd backend`
`npm i`
- Frontend
`cd frontend`
`npm i`

# Run
- Backend
`cd backend`
`npm run dev`
- Frontend
`cd frontend`
`npm start`