import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Zap } from 'lucide-react';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Temporary input for Mapbox token
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);

  const createMarkerElement = (vehicle: Vehicle) => {
    const el = document.createElement('div');
    el.className = `marker-container ${vehicle.status}`;
    el.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          vehicle.status === 'active' ? 'bg-primary animate-pulse-glow' :
          vehicle.status === 'stopped' ? 'bg-secondary' :
          vehicle.status === 'idle' ? 'bg-muted' :
          'bg-destructive'
        }">
          ${vehicle.name.slice(-2)}
        </div>
        ${vehicle.status === 'active' ? 
          '<div class="absolute -top-1 -right-1 w-3 h-3 bg-primary-glow rounded-full animate-ping"></div>' : ''
        }
      </div>
    `;
    
    el.addEventListener('click', () => onVehicleSelect(vehicle));
    return el;
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.006, 40.7128], // NYC coordinates as default
      zoom: 12,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add style and atmosphere
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
    });
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    vehicles.forEach(vehicle => {
      const el = createMarkerElement(vehicle);
      const marker = new mapboxgl.Marker(el)
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .addTo(map.current!);
      
      markers.current[vehicle.id] = marker;
    });
  };

  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap();
    }
  }, [mapboxToken]);

  useEffect(() => {
    updateMarkers();
  }, [vehicles]);

  useEffect(() => {
    if (selectedVehicle && map.current) {
      map.current.flyTo({
        center: [selectedVehicle.longitude, selectedVehicle.latitude],
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedVehicle]);

  if (showTokenInput) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="glass-card p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-poppins font-semibold mb-2">Setup Mapbox</h3>
            <p className="text-muted-foreground text-sm">
              Enter your Mapbox public token to view the live map. Get it from{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="pk.ey..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button 
              onClick={() => setShowTokenInput(false)}
              disabled={!mapboxToken}
              className="w-full"
            >
              Initialize Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Button size="sm" variant="secondary" className="glass-panel">
          <Navigation className="w-4 h-4 mr-2" />
          Recenter
        </Button>
        <Button size="sm" variant="secondary" className="glass-panel">
          <Zap className="w-4 h-4 mr-2" />
          Charging Stations
        </Button>
      </div>

      {/* Vehicle Counter */}
      <div className="absolute top-4 right-4 z-10">
        <div className="glass-panel px-4 py-2">
          <div className="text-sm font-medium">
            Active Vehicles: <span className="text-primary font-bold">{vehicles.filter(v => v.status === 'active').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;