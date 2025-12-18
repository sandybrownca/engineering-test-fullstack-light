import sharp from 'sharp';
import axios from 'axios';

function geoToPixel(
  lon: number,
  lat: number,
  bounds: number[],
  width: number,
  height: number
): { x: number; y: number } {
  const [minLon, maxLat, maxLon, minLat] = bounds;
  
  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  
  return { x: Math.round(x), y: Math.round(y) };
}

function colorToRGB(color: string): { r: number; g: number; b: number } {
  const colors: Record<string, { r: number; g: number; b: number }> = {
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    orange: { r: 255, g: 165, b: 0 },
    yellow: { r: 255, g: 255, b: 0 },
    purple: { r: 128, g: 0, b: 128 },
    white: { r: 255, g: 255, b: 255 },
  };
  
  return colors[color.toLowerCase()] || { r: 255, g: 0, b: 0 };
}

function createPolygonSVG(
  coords: number[][],
  bounds: number[],
  width: number,
  height: number,
  color: string,
  strokeWidth: number = 3
): string {
  const rgb = colorToRGB(color);
  const points = coords
    .map(([lon, lat]) => {
      const { x, y } = geoToPixel(lon, lat, bounds, width, height);
      return `${x},${y}`;
    })
    .join(' ');
  
  return `<polygon points="${points}" fill="none" stroke="rgb(${rgb.r},${rgb.g},${rgb.b})" stroke-width="${strokeWidth}" />`;
}

export async function processImageWithOverlays(
  imageUrl: string,
  imageBounds: number[],
  parcelCoords: number[][] | null,
  buildingCoords: number[][] | null,
  parcelColor?: string,
  buildingColor?: string
): Promise<Buffer> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data);
  
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  
  let svgOverlay = `<svg width="${width}" height="${height}">`;
  
  if (parcelCoords && parcelColor) {
    svgOverlay += createPolygonSVG(parcelCoords, imageBounds, width, height, parcelColor);
  }
  
  if (buildingCoords && buildingColor) {
    svgOverlay += createPolygonSVG(buildingCoords, imageBounds, width, height, buildingColor);
  }
  
  svgOverlay += '</svg>';
  
  const result = await image
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .jpeg()
    .toBuffer();
  
  return result;
}

export async function fetchImage(imageUrl: string): Promise<Buffer> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data);
  
  const result = await sharp(imageBuffer).jpeg().toBuffer();
  
  return result;
}