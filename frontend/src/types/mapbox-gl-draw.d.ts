declare module '@mapbox/mapbox-gl-draw' {
  import mapboxgl from 'mapbox-gl';

  export interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    modes?: any;
    userProperties?: boolean;
  }

  export default class MapboxDraw {
    constructor(options?: DrawOptions);

    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(map: mapboxgl.Map): void;
    getMode(): string;
    changeMode(mode: string, options?: any): void;
    setFeatureProperty(id: string, property: string, value: any): void;
    getAll(): GeoJSON.FeatureCollection;
    getSelected(): GeoJSON.FeatureCollection;
    getSelectedIds(): string[];
    delete(ids: string | string[]): void;
    deleteAll(): void;
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    set(geojson: GeoJSON.FeatureCollection): void;
    get(featureId: string): GeoJSON.Feature | undefined;
    combineFeatures(): void;
    uncombineFeatures(): void;
    trash(): void;
  }
}
