import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GeoJSONSearchRequest, Property } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function CoordinateSearch() {
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [radius, setRadius] = useState('10000');
  const [results, setResults] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const dist = parseFloat(radius);

    if (isNaN(lon) || isNaN(lat) || isNaN(dist)) {
      setError('Please enter valid numbers for all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);

      const searchRequest: GeoJSONSearchRequest = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        'x-distance': dist,
      };

      const response = await fetch(`${API_URL}/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) throw new Error('Search failed');

      const ids = await response.json();
      setResults(ids);

      if (ids.length > 0) {
        const propsResponse = await fetch(`${API_URL}/properties`);
        const allProperties = await propsResponse.json();
        const filtered = allProperties.filter((p: Property) => ids.includes(p.id));
        setProperties(filtered);
      } else {
        setProperties([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Search by Coordinates</h2>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
            <div>
              <label htmlFor="Longitude" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                Longitude
              </label>
              <input
                type="text"
                id="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-80.0782213"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label htmlFor='Latitude' style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                Latitude
              </label>
              <input
                type="text"
                value={latitude}
                id='Latitude'
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="26.8849731"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="radius" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                Search Radius (meters)
              </label>
              <input
                type="text"
                value={radius}
                id="radius"
                onChange={(e) => setRadius(e.target.value)}
                placeholder="10000"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#95a5a6' : '#3498db',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            {error}
          </div>
        )}
      </div>

      {searched && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
            Search Results ({results.length} {results.length === 1 ? 'property' : 'properties'} found)
          </h3>

          {results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d', backgroundColor: 'white', borderRadius: '8px' }}>
              No properties found within the specified radius
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Property ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Longitude</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Latitude</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property, index) => (
                    <tr 
                      key={property.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {property.id}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {property.longitude.toFixed(6)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {property.latitude.toFixed(6)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Link 
                          to={`/property/${property.id}`}
                          style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-block',
                            fontSize: '0.9rem'
                          }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoordinateSearch;