import { destination } from '@turf/turf';
import { Feature, Point } from 'geojson';
export function convertMeterToLongLatitude(x:number, y:number) { 
    const start: [number, number] = [0, 0];
    const movedNorthPoint: Feature<Point> = destination(start, x, 0, { units: 'meters' });
    const movedEastPoint: Feature<Point> = destination(start, y, 90, { units: 'meters' });

    // Extract the new latitude
    const newLatitude = movedNorthPoint.geometry.coordinates[1];
    const newLongtitude = movedEastPoint.geometry.coordinates[0];

    const deltaLat = newLatitude - start[1];
    const deltaLong = newLongtitude - start[0];

    return {
        latitude: x>0 ? Math.abs(deltaLat) : -Math.abs(deltaLat),
        longtitude:y>0 ? Math.abs(deltaLong) : - Math.abs(deltaLong)
    }
}
