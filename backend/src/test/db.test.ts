import { Pool } from 'pg';
import {
  getAllProperties,
  getPropertyById,
  findPropertiesNearPoint,
  getGeometryCoordinates
} from '../db';

// Mock the pg Pool
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Functions', () => {
  let pool: any;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks();
  });

  describe('getAllProperties', () => {
    it('should return all properties with coordinates', async () => {
      const mockProperties = [
        {
          id: 'prop1',
          geocode_geo: 'POINT(-80.078 26.885)',
          parcel_geo: 'POLYGON(...)',
          building_geo: 'POLYGON(...)',
          image_bounds: [-80.08, 26.89, -80.07, 26.88],
          image_url: 'https://example.com/image.tif',
          longitude: -80.078,
          latitude: 26.885,
        },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockProperties });

      const result = await getAllProperties();

      expect(result).toEqual(mockProperties);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
    });

    it('should return empty array when no properties exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getAllProperties();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(getAllProperties()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getPropertyById', () => {
    it('should return a property by ID', async () => {
      const mockProperty = {
        id: 'prop1',
        geocode_geo: 'POINT(-80.078 26.885)',
        longitude: -80.078,
        latitude: 26.885,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockProperty] });

      const result = await getPropertyById('prop1');

      expect(result).toEqual(mockProperty);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['prop1']
      );
    });

    it('should return null when property not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getPropertyById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Query failed'));

      await expect(getPropertyById('prop1')).rejects.toThrow('Query failed');
    });
  });

  describe('findPropertiesNearPoint', () => {
    it('should find properties within distance', async () => {
      const mockResults = [
        { id: 'prop1' },
        { id: 'prop2' },
        { id: 'prop3' },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockResults });

      const result = await findPropertiesNearPoint(-80.078, 26.885, 10000);

      expect(result).toEqual(['prop1', 'prop2', 'prop3']);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ST_DWithin'),
        ['POINT(-80.078 26.885)', 10000]
      );
    });

    it('should return empty array when no properties nearby', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findPropertiesNearPoint(-80.078, 26.885, 100);

      expect(result).toEqual([]);
    });

    it('should handle negative distance gracefully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findPropertiesNearPoint(-80.078, 26.885, -100);

      expect(result).toEqual([]);
    });
  });

  describe('getGeometryCoordinates', () => {
    it('should return parcel and building coordinates', async () => {
      const mockGeoJSON = {
        parcel_json: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[-80.08, 26.89], [-80.07, 26.89], [-80.07, 26.88], [-80.08, 26.88], [-80.08, 26.89]]],
        }),
        building_json: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[-80.075, 26.885], [-80.074, 26.885], [-80.074, 26.884], [-80.075, 26.884], [-80.075, 26.885]]],
        }),
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGeoJSON] });

      const result = await getGeometryCoordinates('prop1');

      expect(result.parcel).toBeDefined();
      expect(result.building).toBeDefined();
      expect(Array.isArray(result.parcel)).toBe(true);
      expect(Array.isArray(result.building)).toBe(true);
    });

    it('should return null for both when property not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getGeometryCoordinates('nonexistent');

      expect(result).toEqual({ parcel: null, building: null });
    });

    it('should handle null geometries', async () => {
      pool.query.mockResolvedValueOnce({ 
        rows: [{ parcel_json: null, building_json: null }] 
      });

      const result = await getGeometryCoordinates('prop1');

      expect(result).toEqual({ parcel: null, building: null });
    });
  });
});