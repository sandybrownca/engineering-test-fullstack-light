import axios from 'axios';
import sharp from 'sharp';
import { processImageWithOverlays, fetchImage } from '../image-processor';

jest.mock('axios');
jest.mock('sharp');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockSharp = sharp as unknown as jest.MockedFunction<typeof sharp>;

describe('Image Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchImage', () => {
    it('should fetch and process an image', async () => {
      const mockImageData = Buffer.from('mock-image-data');
      const mockProcessedData = Buffer.from('mock-processed-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockProcessedData),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const result = await fetchImage('https://example.com/image.tif');

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://example.com/image.tif',
        { responseType: 'arraybuffer' }
      );
      expect(mockSharp).toHaveBeenCalledWith(mockImageData);
      expect(mockSharpInstance.jpeg).toHaveBeenCalled();
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
      expect(result).toEqual(mockProcessedData);
    });

    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchImage('https://example.com/image.tif')).rejects.toThrow('Network error');
    });

    it('should handle image processing errors', async () => {
      const mockImageData = Buffer.from('mock-image-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error('Processing error')),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      await expect(fetchImage('https://example.com/image.tif')).rejects.toThrow('Processing error');
    });
  });

  describe('processImageWithOverlays', () => {
    it('should process image with both overlays', async () => {
      const mockImageData = Buffer.from('mock-image-data');
      const mockProcessedData = Buffer.from('mock-overlay-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
        composite: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockProcessedData),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const parcelCoords = [
        [-80.08, 26.89],
        [-80.07, 26.89],
        [-80.07, 26.88],
        [-80.08, 26.88],
        [-80.08, 26.89],
      ];

      const buildingCoords = [
        [-80.075, 26.885],
        [-80.074, 26.885],
        [-80.074, 26.884],
        [-80.075, 26.884],
        [-80.075, 26.885],
      ];

      const result = await processImageWithOverlays(
        'https://example.com/image.tif',
        [-80.08, 26.89, -80.07, 26.88],
        parcelCoords,
        buildingCoords,
        'orange',
        'green'
      );

      expect(mockAxios.get).toHaveBeenCalled();
      expect(mockSharpInstance.metadata).toHaveBeenCalled();
      expect(mockSharpInstance.composite).toHaveBeenCalled();
      expect(result).toEqual(mockProcessedData);
    });

    it('should process image with only parcel overlay', async () => {
      const mockImageData = Buffer.from('mock-image-data');
      const mockProcessedData = Buffer.from('mock-overlay-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
        composite: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockProcessedData),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const parcelCoords = [
        [-80.08, 26.89],
        [-80.07, 26.89],
        [-80.07, 26.88],
        [-80.08, 26.88],
        [-80.08, 26.89],
      ];

      const result = await processImageWithOverlays(
        'https://example.com/image.tif',
        [-80.08, 26.89, -80.07, 26.88],
        parcelCoords,
        null,
        'orange',
        undefined
      );

      expect(result).toEqual(mockProcessedData);
    });

    it('should process image with only building overlay', async () => {
      const mockImageData = Buffer.from('mock-image-data');
      const mockProcessedData = Buffer.from('mock-overlay-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
        composite: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockProcessedData),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const buildingCoords = [
        [-80.075, 26.885],
        [-80.074, 26.885],
        [-80.074, 26.884],
        [-80.075, 26.884],
        [-80.075, 26.885],
      ];

      const result = await processImageWithOverlays(
        'https://example.com/image.tif',
        [-80.08, 26.89, -80.07, 26.88],
        null,
        buildingCoords,
        undefined,
        'green'
      );

      expect(result).toEqual(mockProcessedData);
    });

    it('should handle missing metadata', async () => {
      const mockImageData = Buffer.from('mock-image-data');

      mockAxios.get.mockResolvedValueOnce({
        data: mockImageData,
      });

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue({}),
        composite: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('data')),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      const result = await processImageWithOverlays(
        'https://example.com/image.tif',
        [-80.08, 26.89, -80.07, 26.88],
        null,
        null,
        undefined,
        undefined
      );

      expect(result).toBeDefined();
    });
  });
});