export interface Property {
  id: string;
  geocode_geo: string;
  parcel_geo: string;
  building_geo: string;
  image_bounds: number[];
  image_url: string;
  longitude: number;
  latitude: number;
}

export interface GeoJSONSearchRequest {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  'x-distance': number;
}