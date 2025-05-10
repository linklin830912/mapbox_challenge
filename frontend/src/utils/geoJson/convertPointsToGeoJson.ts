import { GeoJsonInfo } from "../../models/GeoJsonInfo";
import { Point } from "../../models/Point";
import { convertGeoJsonSourceIdToLayerId } from "./convertGeoJsonSourceIdToLayerId";

export function convertPointsToGeoJson(id: string ,points: Point[][], color?:string) {

    let allPoints: Point[] = [];
    points.forEach(pts => { allPoints = [...allPoints, ...pts] });

    const geoJson = {
      type: 'FeatureCollection',
      features:allPoints.map((p, i) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [p.x, p.y]
            },
            properties: {
                id: i
            }
        })) as GeoJSON.Feature[]
    };

    return {
        id, 
        source:{
            type: 'geojson',
            data: geoJson as GeoJSON.FeatureCollection
        },
        layer:{
          id: convertGeoJsonSourceIdToLayerId(id),
          type: 'circle',
          source: id,
          paint: {
            'circle-radius': 4,
            'circle-color': color ?? "gray",
            'circle-opacity': 0.6
          }
        }
    } as GeoJsonInfo

}
