import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageWithOverlay from '../components/ImageWithOverlay';

describe('ImageWithOverlay', () => {
  const mockPropertyId = 'prop1';

  beforeEach(() => {
    // Mock environment variable
    import.meta.env.VITE_API_URL = 'http://localhost:8080';
  });

  it('should render image without overlays by default', () => {
    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('http://localhost:8080/display/prop1');
    expect(screen.getByText('Enable overlays to see parcel and building boundaries')).toBeInTheDocument();
  });
  it('should render overlay checkbox', () => {
    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });


  it('should show color selectors when overlay is enabled', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });

    await user.click(checkbox);

    expect(screen.getByLabelText('Parcel Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Building Color')).toBeInTheDocument();
  });

  it('should update image URL with overlay parameters', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });

    await user.click(checkbox);

    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toContain('overlay=yes');
    expect(img.src).toContain('parcel=orange');
    expect(img.src).toContain('building=green');
  });

  it('should change parcel color', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    await user.click(checkbox);

    const parcelSelect = screen.getByLabelText('Parcel Color') as HTMLSelectElement;
    await user.selectOptions(parcelSelect, 'red');

    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toContain('parcel=red');
  });

  it('should change building color', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    await user.click(checkbox);

    const buildingSelect = screen.getByLabelText('Building Color') as HTMLSelectElement;
    await user.selectOptions(buildingSelect, 'blue');

    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toContain('building=blue');
  });

  it('should display all available colors', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    await user.click(checkbox);

    const parcelSelect = screen.getByLabelText('Parcel Color') as HTMLSelectElement;
    const options = Array.from(parcelSelect.options).map(opt => opt.value);

    expect(options).toEqual(['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'white']);
  });

  it('should toggle overlay off', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).not.toContain('overlay=yes');
  });

  it('should display overlay status message', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    expect(screen.getByText('Enable overlays to see parcel and building boundaries')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    await user.click(checkbox);

    expect(screen.getByText(/Displaying image with overlays:/)).toBeInTheDocument();
    expect(screen.getByText(/Parcel \(orange\), Building \(green\)/)).toBeInTheDocument();
  });

  it('should update status message when colors change', async () => {
    const user = userEvent.setup();

    render(<ImageWithOverlay propertyId={mockPropertyId} />);

    const checkbox = screen.getByRole('checkbox', {
      name: /Show Parcel & Building Overlays/i,
    });
    await user.click(checkbox);

    const parcelSelect = screen.getByLabelText('Parcel Color');
    const buildingSelect = screen.getByLabelText('Building Color');

    await user.selectOptions(parcelSelect, 'red');
    await user.selectOptions(buildingSelect, 'blue');

    expect(screen.getByText(/Parcel \(red\), Building \(blue\)/)).toBeInTheDocument();
  }); 
});