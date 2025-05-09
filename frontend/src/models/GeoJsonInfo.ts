import { SourceSpecification } from "mapbox-gl"

export type GeoJsonInfo = {
    id: string,
    source: SourceSpecification,
    layer: mapboxgl.Layer, beforeId?: string
}