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
      fixed bottom-0 left-0 right-0 z-20 transition-all duration-500 ease-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      <div className="premium-surface rounded-t-3xl border-t-2 backdrop-blur-2xl animate-slide-up-elegant">
        {/* Toggle Handle */}
        <div className="flex justify-center pt-4 pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="px-12 py-2 hover:bg-white/15 hover-breathe rounded-2xl"
          >
            <div className="w-12 h-1.5 bg-gradient-luxury rounded-full animate-breathe"></div>
          </Button>
        </div>

        {/* Header */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-poppins font-bold bg-gradient-luxury bg-clip-text text-transparent">
              Fleet Status
            </h3>
            <div className="luxury-card px-4 py-2 rounded-xl animate-breathe">
              <span className="text-sm font-bold text-foreground">{vehicles.length} Vehicles</span>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="max-h-96 overflow-y-auto px-8 pb-8">
          <div className="space-y-4">
            {vehicles.map((vehicle, index) => (
              <Card
                key={vehicle.id}
                className={`
                  p-6 cursor-pointer transition-all duration-500 hover:shadow-luxury hover-lift hover-glow
                  ${selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary shadow-luxury scale-105' : ''}
                  luxury-card animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onVehicleSelect(vehicle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-elegant animate-breathe
                      ${vehicle.status === 'active' ? 'status-active' : ''}
                      ${vehicle.status === 'stopped' ? 'status-stopped' : ''}
                      ${vehicle.status === 'idle' ? 'status-idle' : ''}
                      ${vehicle.status === 'maintenance' ? 'status-maintenance' : ''}
                    `}>
                      {getStatusIcon(vehicle.status)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-poppins font-bold text-lg text-foreground">{vehicle.name}</h4>
                        <Badge 
                          variant={getStatusBadgeVariant(vehicle.status)} 
                          className="text-xs font-bold uppercase tracking-wider animate-breathe px-3 py-1 rounded-xl"
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{vehicle.driverId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Gauge className="w-4 h-4" />
                          <span className="font-medium">{vehicle.speed} mph</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`flex items-center space-x-2 mb-1 ${getBatteryColor(vehicle.batteryLevel)}`}>
                        <Battery className="w-5 h-5" />
                        <span className="font-bold text-lg">{vehicle.batteryLevel}%</span>
                      </div>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            vehicle.batteryLevel > 60 ? 'bg-primary animate-pulse-glow' : 
                            vehicle.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-destructive animate-glow-pulse'
                          }`}
                          style={{ width: `${vehicle.batteryLevel}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        {vehicle.batteryLevel > 60 ? 'Excellent' : 
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