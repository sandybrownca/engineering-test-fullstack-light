import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Props {
  propertyId: string;
}

function ImageWithOverlay({ propertyId }: Props) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [parcelColor, setParcelColor] = useState('orange');
  const [buildingColor, setBuildingColor] = useState('green');

  const colors = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'white'];

  const getImageUrl = () => {
    let url = `${API_URL}/display/${propertyId}`;
    
    if (showOverlay) {
      url += `?overlay=yes&parcel=${parcelColor}&building=${buildingColor}`;
    }
    
    return url;
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor='overlay' style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            id='overlay'
            checked={showOverlay}
            onChange={(e) => setShowOverlay(e.target.checked)}
            style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: 600, color: '#2c3e50' }}>Show Parcel & Building Overlays</span>
        </label>

        {showOverlay && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div>
              <label htmlFor='parcelColor' style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                Parcel Color
              </label>
              <select
                value={parcelColor}
                id='parcelColor'
                onChange={(e) => setParcelColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                }}
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor='buildingColor' style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                Building Color
              </label>
              <select
                value={buildingColor}
                id='buildingColor'
                onChange={(e) => setBuildingColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                }}
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        <img
          src={getImageUrl()}
          alt={`Property ${propertyId}`}
          style={{ width: '100%', display: 'block' }}
          key={getImageUrl()}
        />
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        {showOverlay ? (
          <>
            Displaying image with overlays: Parcel ({parcelColor}), Building ({buildingColor})
          </>
        ) : (
          'Enable overlays to see parcel and building boundaries'
        )}
      </div>
    </div>
  );
}

export default ImageWithOverlay;