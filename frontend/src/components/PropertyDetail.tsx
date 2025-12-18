import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Property } from '../types';
import ImageWithOverlay from './ImageWithOverlay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/properties`);
      if (!response.ok) throw new Error('Failed to fetch property');
      const data = await response.json();
      const found = data.find((p: Property) => p.id === propertyId);
      if (!found) throw new Error('Property not found');
      setProperty(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error || 'Property not found'}
        </div>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        ← Back to Properties
      </Link>

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Details</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Property ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{property.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Longitude</dt>
            <dd className="mt-1 text-sm text-gray-900">{property.longitude.toFixed(6)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Latitude</dt>
            <dd className="mt-1 text-sm text-gray-900">{property.latitude.toFixed(6)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Image Bounds</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              [{property.image_bounds.map(b => b.toFixed(6)).join(', ')}]
            </dd>
          </div>
        </dl>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Property Image with Overlays</h3>
      <ImageWithOverlay propertyId={property.id} />
    </div>
  );
}

export default PropertyDetail;