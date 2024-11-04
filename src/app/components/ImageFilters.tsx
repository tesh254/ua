import React, { useEffect, useRef, useState } from 'react';

type FilterType = 'none' | 'grayscale' | 'blur' | 'sharpen' | 'edge' | 'emboss';

interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export const ImageFilters: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filter, setFilter] = useState<FilterType>('none');
  const [intensity, setIntensity] = useState(1);
  const imageDataRef = useRef<ImageData | null>(null);

  // Convolution kernels for different effects
  const kernels = {
    blur: [
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9]
    ],
    sharpen: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ],
    edge: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1]
    ],
    emboss: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2]
    ]
  };

  // Apply convolution to image data
  const applyConvolution = (imageData: ImageData, kernel: number[][], factor = 1) => {
    const output = new Uint8ClampedArray(imageData.data.length);
    const { width, height } = imageData;
    const kSize = kernel.length;
    const kOffset = Math.floor(kSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        // Apply kernel to each pixel
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const ix = Math.min(Math.max(x + kx - kOffset, 0), width - 1);
            const iy = Math.min(Math.max(y + ky - kOffset, 0), height - 1);
            const ipx = (iy * width + ix) * 4;
            const k = kernel[ky][kx] * factor;

            r += imageData.data[ipx] * k;
            g += imageData.data[ipx + 1] * k;
            b += imageData.data[ipx + 2] * k;
          }
        }

        output[px] = Math.min(Math.max(r, 0), 255);
        output[px + 1] = Math.min(Math.max(g, 0), 255);
        output[px + 2] = Math.min(Math.max(b, 0), 255);
        output[px + 3] = imageData.data[px + 3];
      }
    }

    return new ImageData(output, width, height);
  };

  // Convert to grayscale
  const applyGrayscale = (imageData: ImageData) => {
    const output = new Uint8ClampedArray(imageData.data.length);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      output[i] = gray;
      output[i + 1] = gray;
      output[i + 2] = gray;
      output[i + 3] = imageData.data[i + 3];
    }

    return new ImageData(output, imageData.width, imageData.height);
  };

  // Apply selected filter
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageDataRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let filteredData: ImageData;

    switch (filter) {
      case 'grayscale':
        filteredData = applyGrayscale(imageDataRef.current);
        break;
      case 'blur':
        filteredData = applyConvolution(imageDataRef.current, kernels.blur, intensity);
        break;
      case 'sharpen':
        filteredData = applyConvolution(imageDataRef.current, kernels.sharpen, intensity);
        break;
      case 'edge':
        filteredData = applyConvolution(imageDataRef.current, kernels.edge, intensity);
        break;
      case 'emboss':
        filteredData = applyConvolution(imageDataRef.current, kernels.emboss, intensity);
        break;
      default:
        ctx.putImageData(imageDataRef.current, 0, 0);
        return;
    }

    ctx.putImageData(filteredData, 0, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a sample image with gradients and shapes
    const drawSampleImage = () => {
      // Clear canvas
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw some sample shapes
      // Gradient circle
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.4,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        100
      );
      gradient.addColorStop(0, '#60A5FA');
      gradient.addColorStop(1, '#3B82F6');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.3, canvas.height * 0.4, 100, 0, Math.PI * 2);
      ctx.fill();

      // Rectangle
      ctx.fillStyle = '#34D399';
      ctx.fillRect(canvas.width * 0.5, canvas.height * 0.2, 150, 150);

      // Triangle
      ctx.fillStyle = '#F87171';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.7, canvas.height * 0.7);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.4);
      ctx.lineTo(canvas.width * 0.9, canvas.height * 0.7);
      ctx.closePath();
      ctx.fill();

      // Store the initial image data
      imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    const handleResize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawSampleImage();
      applyFilter();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, intensity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="none">None</option>
          <option value="grayscale">Grayscale</option>
          <option value="blur">Blur</option>
          <option value="sharpen">Sharpen</option>
          <option value="edge">Edge Detection</option>
          <option value="emboss">Emboss</option>
        </select>

        {filter !== 'none' && filter !== 'grayscale' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Intensity:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-400">{intensity.toFixed(1)}</span>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-lg bg-gray-900"
      />
    </div>
  );
};
