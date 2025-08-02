import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Battery, Gauge, User, Navigation, AlertTriangle, Zap } from 'lucide-react';

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

interface VehicleListProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicle?: Vehicle;
  isVisible: boolean;
  onToggle: () => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ 
  vehicles, 
  onVehicleSelect, 
  selectedVehicle, 
  isVisible, 
  onToggle 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Navigation className="w-4 h-4" />;
      case 'stopped':
        return <Gauge className="w-4 h-4" />;
      case 'idle':
        return <Zap className="w-4 h-4" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'idle':
        return 'outline';
      case 'maintenance':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      <div className="glass-panel rounded-t-2xl border-t">
        {/* Toggle Handle */}
        <div className="flex justify-center pt-2 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="px-8 py-1 hover:bg-white/10"
          >
            <div className="w-8 h-1 bg-muted-foreground rounded-full"></div>
          </Button>
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-poppins font-semibold">Fleet Status</h3>
            <Badge variant="outline" className="glass-card">
              {vehicles.length} Vehicles
            </Badge>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="max-h-96 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`
                  p-4 cursor-pointer transition-all duration-200 hover:shadow-elegant hover-lift
                  ${selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary shadow-glow' : ''}
                  glass-card
                `}
                onClick={() => onVehicleSelect(vehicle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                      ${vehicle.status === 'active' ? 'status-active' : ''}
                      ${vehicle.status === 'stopped' ? 'status-stopped' : ''}
                      ${vehicle.status === 'idle' ? 'status-idle' : ''}
                      ${vehicle.status === 'maintenance' ? 'status-maintenance' : ''}
                    `}>
                      {getStatusIcon(vehicle.status)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-poppins font-medium">{vehicle.name}</h4>
                        <Badge variant={getStatusBadgeVariant(vehicle.status)} className="text-xs">
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{vehicle.driverId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Gauge className="w-3 h-3" />
                          <span>{vehicle.speed} mph</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${getBatteryColor(vehicle.batteryLevel)}`}>
                        <Battery className="w-4 h-4" />
                        <span className="font-medium">{vehicle.batteryLevel}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.batteryLevel > 60 ? 'Good' : 
                         vehicle.batteryLevel > 30 ? 'Low' : 'Critical'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;