import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Phone, AlertTriangle, MapPin, Navigation, Clock } from 'lucide-react';

interface InstructorWithDistance {
  id: string;
  name: string;
  phone: string | null;
  group: string | null;
  distance: number | null;
  isPresent: boolean;
}

const emergencyNumbers = [
  { label: 'Appel d\'urgence', number: '112', icon: AlertTriangle, color: 'bg-red-600' },
  { label: 'Pompiers', number: '18', icon: AlertTriangle, color: 'bg-orange-600' },
  { label: 'Police', number: '17', icon: AlertTriangle, color: 'bg-blue-600' },
];

export default function Urgence() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWednesdaySchedule, setIsWednesdaySchedule] = useState(false);

  // Check if today is Wednesday and between 14h-18h
  useEffect(() => {
    const checkWednesdaySchedule = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();
      
      // Wednesday = 3 (0=Sunday, 1=Monday, ..., 3=Wednesday)
      const isWednesday = dayOfWeek === 3;
      const isBetween14And18 = hour >= 14 && hour < 18;
      
      setIsWednesdaySchedule(isWednesday && isBetween14And18);
    };

    checkWednesdaySchedule();
  }, []);

  // Get user location with 30-second refresh
  useEffect(() => {
    const updateLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
            setLocationError(null);
          },
          (error) => {
            setLocationError('Position GPS non disponible');
            console.error('Geolocation error:', error);
          }
        );
      } else {
        setLocationError('Géolocalisation non supportée');
      }
    };

    // Initial location fetch
    updateLocation();

    // Set up 30-second refresh interval
    const interval = setInterval(updateLocation, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get instructors and their planning
  const { data: instructors = [] } = useQuery({
    queryKey: ['/api/instructors'],
    queryFn: async () => {
      const response = await fetch('/api/instructors', {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error('Impossible de charger les encadrants');
      const data = await response.json();
      return data.instructors || [];
    },
    enabled: !!sessionId,
  });

  // Get planning data to check which instructors are present
  const { data: planning = [] } = useQuery({
    queryKey: ['/api/planning'],
    queryFn: async () => {
      const response = await fetch('/api/planning', {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error('Impossible de charger le planning');
      const data = await response.json();
      return data.planning || [];
    },
    enabled: !!sessionId,
  });

  // Calculate distances and sort instructors
  const instructorsWithDistance: InstructorWithDistance[] = instructors
    .filter((inst: any) => inst.phone)
    .map((inst: any) => {
      // Check if instructor is present on Wednesday between 14h-18h
      const planningEntry = planning.find((p: any) => 
        p.instructorId === inst.id && 
        p.status === 'present'
      );
      
      // If Wednesday schedule is active, only show present instructors
      const isPresent = !isWednesdaySchedule || !!planningEntry;
      
      let distance: number | null = null;
      
      if (userLocation && inst.latitude && inst.longitude) {
        // Haversine formula to calculate distance
        const R = 6371; // Earth's radius in km
        const lat1 = (userLocation.lat * Math.PI) / 180;
        const lat2 = (parseFloat(inst.latitude) * Math.PI) / 180;
        const deltaLat = ((parseFloat(inst.latitude) - userLocation.lat) * Math.PI) / 180;
        const deltaLon = ((parseFloat(inst.longitude) - userLocation.lon) * Math.PI) / 180;
        
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }
      
      return {
        id: inst.id,
        name: inst.name,
        phone: inst.phone,
        group: inst.group,
        distance,
        isPresent,
      };
    })
    .filter((inst: InstructorWithDistance) => inst.isPresent)
    .sort((a: InstructorWithDistance, b: InstructorWithDistance) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return (a.distance || 0) - (b.distance || 0);
    });

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Urgence" subtitle="Appels d'urgence et encadrants proches" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Schedule Status */}
          {isWednesdaySchedule && (
            <Card className="p-4 bg-blue-900/20 border-blue-600">
              <p className="text-blue-200 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Mode mercredi 14h-18h activé - Affichage des encadrants présents uniquement
              </p>
            </Card>
          )}

          {/* Emergency Numbers */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Numéros d'urgence</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {emergencyNumbers.map((emergency) => {
                const Icon = emergency.icon;
                return (
                  <Button
                    key={emergency.number}
                    onClick={() => handleCall(emergency.number)}
                    className={`${emergency.color} h-32 flex flex-col items-center justify-center gap-3 text-white font-bold`}
                    data-testid={`button-call-${emergency.number}`}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="text-2xl">{emergency.number}</span>
                    <span className="text-xs">{emergency.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Location Status */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Encadrants proches</h2>
            {locationError ? (
              <Card className="p-6 bg-yellow-900/20 border-yellow-600">
                <p className="text-yellow-200 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {locationError}
                </p>
              </Card>
            ) : userLocation ? (
              <Card className="p-4 bg-green-900/20 border-green-600 mb-6">
                <p className="text-green-200 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Position: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                  <span className="text-xs text-green-300 ml-2">(Actualisation toutes les 30s)</span>
                </p>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">Détection de la position en cours...</p>
              </Card>
            )}
          </div>

          {/* Instructors List */}
          <div>
            {instructorsWithDistance.length === 0 ? (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  {isWednesdaySchedule 
                    ? 'Aucun encadrant présent mercredi 14h-18h' 
                    : 'Aucun encadrant avec téléphone disponible'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {instructorsWithDistance.map((instructor) => (
                  <Card
                    key={instructor.id}
                    className="p-4 flex items-center justify-between hover-elevate active-elevate-2"
                    data-testid={`card-instructor-${instructor.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{instructor.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        {instructor.group && (
                          <span>{instructor.group}</span>
                        )}
                        {instructor.distance !== null && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {instructor.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(instructor.phone!)}
                      size="icon"
                      className="ml-4"
                      data-testid={`button-call-instructor-${instructor.id}`}
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
