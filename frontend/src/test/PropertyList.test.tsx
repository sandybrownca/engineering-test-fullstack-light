import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropertyList from '../components/PropertyList';

const mockProperties = [
  {
    id: 'prop1',
    geocode_geo: 'POINT(-80.078 26.885)',
    parcel_geo: 'POLYGON(...)',
    building_geo: 'POLYGON(...)',
    image_bounds: [-80.08, 26.89, -80.07, 26.88],
    image_url: 'https://example.com/image.tif',
    longitude: -80.078221,
    latitude: 26.884973,
  },
  {
    id: 'prop2',
    geocode_geo: 'POINT(-87.644 41.923)',
    parcel_geo: 'POLYGON(...)',
    building_geo: 'POLYGON(...)',
    image_bounds: [-87.65, 41.93, -87.64, 41.92],
    image_url: 'https://example.com/image2.tif',
    longitude: -87.644056,
    latitude: 41.922656,
  },
];

describe('PropertyList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading properties...')).toBeInTheDocument();
  });

  it('should render properties after successful fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockProperties,
      } as Response)
    );

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('All Properties')).toBeInTheDocument();
    });

    expect(screen.getByText('prop1')).toBeInTheDocument();
    expect(screen.getByText('prop2')).toBeInTheDocument();
    expect(screen.getByText('-80.078221')).toBeInTheDocument();
    expect(screen.getByText('26.884973')).toBeInTheDocument();
    expect(screen.getByText('Total properties: 2')).toBeInTheDocument();
  });

  it('should render error message on fetch failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      } as Response)
    );

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch properties/)).toBeInTheDocument();
  });

  it('should render empty state when no properties', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response)
    );

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('All Properties')).toBeInTheDocument();
    });

    expect(screen.getByText('Total properties: 0')).toBeInTheDocument();
  });

  it('should render view details links', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockProperties,
      } as Response)
    );

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      const links = screen.getAllByText('View Details');
      expect(links).toHaveLength(2);
    });
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <BrowserRouter>
        <PropertyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});