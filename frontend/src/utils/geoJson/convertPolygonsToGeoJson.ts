import { mapGridToGeojsonPolygon } from "../../mappers/mapGridToGeojsonPolygon";
import { GeoJsonInfo } from "../../models/GeoJsonInfo";
import { Polygon } from "../../models/Polygon";
import { convertGeoJsonSourceIdToLayerId } from "./convertGeoJsonSourceIdToLayerId";

export function convertPolygonsToGeoJson(id: string ,polygons: Polygon[], color?:string) {

  
    const features: GeoJSON.Feature[] = [];

  const poly: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: mapGridToGeojsonPolygon(polygons)
      };
    features.push({ type: 'Feature', geometry: poly, properties: {} })

    const gridGeoJSON = {
        type: 'FeatureCollection',
        features
        };
    
    return {
        id: id,
        source:{
            type: 'geojson',
            data: gridGeoJSON as GeoJSON.FeatureCollection
        },
        layer:{
            id: convertGeoJsonSourceIdToLayerId(id),
            type: 'line',
            source: id,
            paint: {
              'line-color': color ?? '#ff6600',
              'line-width': 2
            },
          }
    } as GeoJsonInfo

}



