import { mapGridToGeojsonPolygon } from "../../mappers/mapGridToGeojsonPolygon";
import { GeoJsonInfo } from "../../models/GeoJsonInfo";
import { Grid } from "../../models/Grid";
import { convertGeoJsonSourceIdToLayerId } from "./convertGeoJsonSourceIdToLayerId";

export function convertGridToGeoJson(id0: string, id1: string ,grid: Grid, color?:string):GeoJsonInfo[] {

    const featuresValid: GeoJSON.Feature[] = [];
    const polyValid: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: mapGridToGeojsonPolygon(grid).filter(poly => poly.isValid).map(poly => poly.polygon)
    };
    featuresValid.push({ type: 'Feature', geometry: polyValid, properties: {} })

    const gridGeoJSONValid = {
        type: 'FeatureCollection',
        features: featuresValid
    };

    const featuresInValid: GeoJSON.Feature[] = [];
    const polyInValid: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: mapGridToGeojsonPolygon(grid).filter(poly => !poly.isValid).map(poly => poly.polygon)
    };
    featuresInValid.push({ type: 'Feature', geometry: polyInValid, properties: {} })

    const gridGeoJSONInValid = {
        type: 'FeatureCollection',
        features: featuresInValid
    };
    
    return [
        {
            id: id0,
            source:{
                type: 'geojson',
                data: gridGeoJSONValid as GeoJSON.FeatureCollection
            },
            layer:{
                id: convertGeoJsonSourceIdToLayerId(id0),
                type: 'line',
                source: id0,
                paint: {
                    'line-color': color ?? 'red',
                    'line-width': 2.5
                },
            }
        },
        {
            id: id1,
            source:{
                type: 'geojson',
                data: gridGeoJSONInValid as GeoJSON.FeatureCollection
            },
            layer:{
                id: convertGeoJsonSourceIdToLayerId(id1),
                type: 'line',
                source: id1,
                paint: {
                'line-color': color ?? 'white',
                'line-width': 0.5
                },
            }
        }
    ]

}



