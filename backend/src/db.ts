import { Pool } from 'pg';

// Database connection pool
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5555'),
  database: process.env.DB_NAME || 'zesty',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'engineTest888',
});

// Property interface matching database schema
export interface Property {
  id: string;
  geocode_geo: string;
  parcel_geo: string;
  building_geo: string;
  image_bounds: number[];
  image_url: string;
  longitude?: number;
  latitude?: number;
}

// Get all properties with extracted coordinates
export async function getAllProperties(): Promise<Property[]> {
  const query = `
    SELECT 
      id,
      geocode_geo,
      parcel_geo,
      building_geo,
      image_bounds,
      image_url,
      ST_X(geocode_geo::geometry) as longitude,
      ST_Y(geocode_geo::geometry) as latitude
    FROM properties
    ORDER BY id
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

// Get single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  const query = `
    SELECT 
      id,
      geocode_geo,
      parcel_geo,
      building_geo,
      image_bounds,
      image_url,
      ST_X(geocode_geo::geometry) as longitude,
      ST_Y(geocode_geo::geometry) as latitude
    FROM properties
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// Find properties within distance from a point
export async function findPropertiesNearPoint(
  longitude: number,
  latitude: number,
  distance: number
): Promise<string[]> {
  const query = `
    SELECT id
    FROM properties
    WHERE ST_DWithin(
      geocode_geo,
      ST_GeogFromText($1),
      $2
    )
    ORDER BY id
  `;
  
  const point = `POINT(${longitude} ${latitude})`;
  const result = await pool.query(query, [point, distance]);
  
  return result.rows.map(row => row.id);
}

// Extract coordinates from geography polygons for overlay rendering
export async function getGeometryCoordinates(id: string): Promise<{
  parcel: number[][] | null;
  building: number[][] | null;
}> {
  const query = `
    SELECT 
      ST_AsGeoJSON(parcel_geo::geometry) as parcel_json,
      ST_AsGeoJSON(building_geo::geometry) as building_json
    FROM properties
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    return { parcel: null, building: null };
  }
  
  const row = result.rows[0];
  
  const parcel = row.parcel_json 
    ? JSON.parse(row.parcel_json).coordinates[0] 
    : null;
    
  const building = row.building_json 
    ? JSON.parse(row.building_json).coordinates[0] 
    : null;
  
  return { parcel, building };
}