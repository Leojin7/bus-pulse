import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import VehicleList from './VehicleList';
import NotificationBanner from './NotificationBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, Menu, Bell, Settings, User } from 'lucide-react';
import heroImage from '@/assets/ebus-hero.png';

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

const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'Bus 001',
      latitude: 40.7128,
      longitude: -74.0060,
      status: 'active',
      batteryLevel: 85,
      speed: 25,
      driverId: 'D001'
    },
    {
      id: '2', 
      name: 'Bus 002',
      latitude: 40.7589,
      longitude: -73.9851,
      status: 'stopped',
      batteryLevel: 92,
      speed: 0,
      driverId: 'D002'
    },
    {
      id: '3',
      name: 'Bus 003', 
      latitude: 40.7282,
      longitude: -73.7949,
      status: 'idle',
      batteryLevel: 67,
      speed: 5,
      driverId: 'D003'
    },
    {
      id: '4',
      name: 'Bus 004',
      latitude: 40.6892,
      longitude: -74.0445,
      status: 'maintenance',
      batteryLevel: 23,
      speed: 0,
      driverId: 'D004'
    }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [isVehicleListVisible, setIsVehicleListVisible] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => ({
          ...vehicle,
          // Simulate slight position changes for active vehicles
          latitude: vehicle.status === 'active' 
            ? vehicle.latitude + (Math.random() - 0.5) * 0.001
            : vehicle.latitude,
          longitude: vehicle.status === 'active'
            ? vehicle.longitude + (Math.random() - 0.5) * 0.001
            : vehicle.longitude,
          // Simulate speed variations
          speed: vehicle.status === 'active'
            ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10)
            : vehicle.speed,
          // Simulate battery drain
          batteryLevel: vehicle.status === 'active'
            ? Math.max(0, vehicle.batteryLevel - 0.1)
            : vehicle.batteryLevel
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Show welcome notification
  useEffect(() => {
    setTimeout(() => {
      setNotification({
        message: 'E-Bus Management System initialized. Real-time tracking active.',
        type: 'success',
        visible: true
      });
    }, 1000);
  }, []);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setNotification({
      message: `Selected ${vehicle.name} - ${vehicle.status} (${vehicle.batteryLevel}% battery)`,
      type: 'info',
      visible: true
    });
  };

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const lowBatteryVehicles = vehicles.filter(v => v.batteryLevel < 30).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/20">
      {/* Header */}
      <header className="glass-panel border-b backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-poppins font-bold text-foreground">E-Bus Management</h1>
                <p className="text-sm text-muted-foreground">Real-Time Fleet Tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="hidden md:flex items-center space-x-4">
                <Badge variant="outline" className="glass-card">
                  Active: {activeVehicles}
                </Badge>
                {lowBatteryVehicles > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Low Battery: {lowBatteryVehicles}
                  </Badge>
                )}
              </div>

              {/* Controls */}
              <Button size="sm" variant="ghost" className="hover:bg-white/10">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-white/10">
                <User className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-white/10">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <MapView
          vehicles={vehicles}
          onVehicleSelect={handleVehicleSelect}
          selectedVehicle={selectedVehicle}
        />

        {/* Mobile Toggle Button */}
        <Button
          className="fixed bottom-6 right-6 z-30 rounded-full w-14 h-14 shadow-elegant glass-panel hover:shadow-glow"
          onClick={() => setIsVehicleListVisible(!isVehicleListVisible)}
        >
          <Menu className="w-6 h-6" />
        </Button>

        <VehicleList
          vehicles={vehicles}
          onVehicleSelect={handleVehicleSelect}
          selectedVehicle={selectedVehicle}
          isVisible={isVehicleListVisible}
          onToggle={() => setIsVehicleListVisible(!isVehicleListVisible)}
        />
      </div>

      {/* Notification Banner */}
      <NotificationBanner
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export default Dashboard;