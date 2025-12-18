import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CoordinateSearch from '../components/CoordinateSearch';

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
];

describe('CoordinateSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search form', () => {
    render(
      <BrowserRouter>
        <CoordinateSearch />
      </BrowserRouter>
    );

    expect(screen.getByText('Search by Coordinates')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Radius (meters)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should perform search and display results', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ['prop1'],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperties,
      } as Response);

    render(
      <BrowserRouter>
        <CoordinateSearch />
      </BrowserRouter>
    );

    const lonInput = screen.getByLabelText('Longitude');
    const latInput = screen.getByLabelText('Latitude');
    const radiusInput = screen.getByLabelText('Search Radius (meters)');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(lonInput, '-80.078');
    await user.type(latInput, '26.885');
    await user.clear(radiusInput);
    await user.type(radiusInput, '5000');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Search Results (1 property found)')).toBeInTheDocument();
    });

    expect(screen.getByText('prop1')).toBeInTheDocument();
  });

  it('should display no results message', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    render(
      <BrowserRouter>
        <CoordinateSearch />
      </BrowserRouter>
    );

    const lonInput = screen.getByLabelText('Longitude');
    const latInput = screen.getByLabelText('Latitude');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(lonInput, '-80.078');
    await user.type(latInput, '26.885');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Search Results (0 properties found)')).toBeInTheDocument();
    });

    expect(screen.getByText('No properties found within the specified radius')).toBeInTheDocument();
  });

  it('should handle search API errors', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      } as Response)
    );

    render(
      <BrowserRouter>
        <CoordinateSearch />
      </BrowserRouter>
    );

    const lonInput = screen.getByLabelText('Longitude');
    const latInput = screen.getByLabelText('Latitude');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(lonInput, '-80.078');
    await user.type(latInput, '26.885');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Search failed/)).toBeInTheDocument();
    });
  });

  it('should show loading state during search', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <CoordinateSearch />
      </BrowserRouter>
    );

    const lonInput = screen.getByLabelText('Longitude');
    const latInput = screen.getByLabelText('Latitude');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(lonInput, '-80.078');
    await user.type(latInput, '26.885');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });
  
});