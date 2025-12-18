import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  getAllProperties,
  getPropertyById,
  findPropertiesNearPoint,
  getGeometryCoordinates,
} from './db';
import { processImageWithOverlays, fetchImage } from './image-processor';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/properties', async (req: Request, res: Response) => {
  try {
    const properties = await getAllProperties();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

app.post('/find', async (req: Request, res: Response) => {
  try {
    const { geometry, 'x-distance': distance } = req.body;
    
    if (!geometry || !geometry.coordinates || !distance) {
      return res.status(400).json({ 
        error: 'Invalid request body. Expected GeoJSON with x-distance property' 
      });
    }
    
    const [longitude, latitude] = geometry.coordinates;
    
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    const propertyIds = await findPropertiesNearPoint(longitude, latitude, distance);
    res.json(propertyIds);
  } catch (error) {
    console.error('Error finding properties:', error);
    res.status(500).json({ error: 'Failed to find properties' });
  }
});

app.get('/display/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { overlay, parcel, building } = req.query;
    
    if (!id || id.length === 0) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    const property = await getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    let imageBuffer: Buffer;
    
    if (overlay === 'yes' && (parcel || building)) {
      const geometries = await getGeometryCoordinates(id);
      
      imageBuffer = await processImageWithOverlays(
        property.image_url,
        property.image_bounds,
        geometries.parcel,
        geometries.building,
        parcel as string | undefined,
        building as string | undefined
      );
    } else {
      imageBuffer = await fetchImage(property.image_url);
    }
    
    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error displaying image:', error);
    res.status(500).json({ error: 'Failed to display image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});