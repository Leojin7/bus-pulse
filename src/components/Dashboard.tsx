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
    <div className="min-h-screen bg-gradient-hero texture-dots relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-surface"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern-grid opacity-20"></div>
      
      {/* Header */}
      <header className="premium-surface border-b backdrop-blur-2xl relative z-10 animate-fade-in-up">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-scale-in">
              <div className="w-12 h-12 bg-gradient-luxury rounded-2xl flex items-center justify-center shadow-luxury hover-glow animate-breathe">
                <Bus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-poppins font-bold bg-gradient-luxury bg-clip-text text-transparent">
                  E-Bus Management
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Real-Time Fleet Tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Status Indicators */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="luxury-card px-4 py-2 rounded-xl hover-glow animate-breathe">
                  <span className="text-sm font-bold text-foreground">Active: {activeVehicles}</span>
                </div>
                {lowBatteryVehicles > 0 && (
                  <div className="luxury-card px-4 py-2 rounded-xl bg-destructive/10 border-destructive/20 animate-glow-pulse">
                    <span className="text-sm font-bold text-destructive">Low Battery: {lowBatteryVehicles}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="glass" className="hover-breathe rounded-xl">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="glass" className="hover-breathe rounded-xl">
                  <User className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="glass" className="hover-breathe rounded-xl">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-100px)] relative z-10 animate-slide-up-elegant">
        <div className="premium-surface m-4 rounded-3xl overflow-hidden shadow-luxury hover-lift animate-float">
          <MapView
            vehicles={vehicles}
            onVehicleSelect={handleVehicleSelect}
            selectedVehicle={selectedVehicle}
          />
        </div>

        {/* Mobile Toggle Button */}
        <Button
          className="fixed bottom-8 right-8 z-30 rounded-full w-16 h-16 shadow-luxury luxury-card hover:shadow-glow animate-breathe hover-lift"
          onClick={() => setIsVehicleListVisible(!isVehicleListVisible)}
        >
          <Menu className="w-7 h-7" />
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