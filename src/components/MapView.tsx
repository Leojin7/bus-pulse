import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Zap, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'stopped' | 'idle' | 'maintenance';
  batteryLevel: number;
  speed: number;
  driverId: string;
}

interface MapViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicle?: Vehicle;
}

const MapView: React.FC<MapViewProps> = ({ vehicles, onVehicleSelect, selectedVehicle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    // Simple projection for demo purposes
    // In a real app, you'd use proper map projection
    const centerLat = 40.7128; // NYC center
    const centerLng = -74.0060;
    
    const x = (canvas.width / 2) + ((lng - centerLng) * 5000 * zoom) + panX;
    const y = (canvas.height / 2) - ((lat - centerLat) * 5000 * zoom) + panY;
    
    return { x, y };
  };

  // Find vehicle at click position
  const getVehicleAtPosition = (clickX: number, clickY: number) => {
    return vehicles.find(vehicle => {
      const pos = latLngToCanvas(vehicle.latitude, vehicle.longitude);
      const distance = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
      return distance < 20; // 20px click radius
    });
  };

  // Draw the map
  const drawMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    const gridSize = 50 * zoom;
    
    for (let x = (panX % gridSize); x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = (panY % gridSize); y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw roads (simplified)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 3 * zoom;
    
    // Horizontal roads
    for (let i = 0; i < 5; i++) {
      const y = (canvas.height / 6) * (i + 1) + panY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical roads
    for (let i = 0; i < 7; i++) {
      const x = (canvas.width / 8) * (i + 1) + panX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw vehicles
    vehicles.forEach(vehicle => {
      const pos = latLngToCanvas(vehicle.latitude, vehicle.longitude);
      
      // Skip if outside canvas
      if (pos.x < -30 || pos.x > canvas.width + 30 || pos.y < -30 || pos.y > canvas.height + 30) {
        return;
      }

      const size = 16 * zoom;
      const isSelected = selectedVehicle?.id === vehicle.id;
      
      // Draw selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = '#007BFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw vehicle marker
      ctx.save();
      
      // Get status color
      let color;
      switch (vehicle.status) {
        case 'active':
          color = '#007BFF';
          break;
        case 'stopped':
          color = '#C0C0C0';
          break;
        case 'idle':
          color = '#94A3B8';
          break;
        case 'maintenance':
          color = '#EF4444';
          break;
        default:
          color = '#6B7280';
      }

      // Draw main circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw white border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw vehicle number
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.max(10, 8 * zoom)}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(vehicle.name.slice(-2), pos.x, pos.y);

      // Draw pulsing effect for active vehicles
      if (vehicle.status === 'active') {
        const pulseSize = size + 4 + Math.sin(Date.now() / 300) * 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulseSize, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}60`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // Draw speed indicator for moving vehicles
      if (vehicle.speed > 0 && zoom > 0.5) {
        const speedBarHeight = Math.min(vehicle.speed / 2, 20) * zoom;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(pos.x + size + 4, pos.y - speedBarHeight / 2, 3, speedBarHeight);
      }
    });

    // Draw center crosshair
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a vehicle
    const clickedVehicle = getVehicleAtPosition(x, y);
    if (clickedVehicle) {
      onVehicleSelect(clickedVehicle);
      return;
    }
    
    setIsDragging(true);
    setLastMousePos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - lastMousePos.x;
    const deltaY = y - lastMousePos.y;
    
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastMousePos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.3, prev / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const focusOnVehicle = (vehicle: Vehicle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerLat = 40.7128;
    const centerLng = -74.0060;
    
    const targetX = -((vehicle.longitude - centerLng) * 5000 * zoom);
    const targetY = ((vehicle.latitude - centerLat) * 5000 * zoom);
    
    setPanX(targetX);
    setPanY(targetY);
  };

  // Focus on selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      focusOnVehicle(selectedVehicle);
    }
  }, [selectedVehicle]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawMap();
      requestAnimationFrame(animate);
    };
    animate();
  }, [vehicles, zoom, panX, panY, selectedVehicle]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-1 relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        width={800}
        height={600}
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Button 
          size="sm" 
          variant="glass" 
          className="glass-panel"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <div className="flex flex-col space-y-1">
          <Button 
            size="sm" 
            variant="glass" 
            className="glass-panel p-2"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="glass" 
            className="glass-panel p-2"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Vehicle Counter */}
      <div className="absolute top-4 right-4 z-10">
        <div className="glass-panel px-4 py-2">
          <div className="text-sm font-medium">
            Active Vehicles: <span className="text-primary font-bold">{vehicles.filter(v => v.status === 'active').length}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="glass-panel px-3 py-2 text-xs text-muted-foreground max-w-xs">
          <div className="space-y-1">
            <div>• Click vehicles to select them</div>
            <div>• Drag to pan the map</div>
            <div>• Scroll to zoom in/out</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;