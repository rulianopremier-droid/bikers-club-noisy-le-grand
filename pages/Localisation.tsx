import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from 'wouter';

interface InstructorLocation {
  id: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  latitude: string;
  longitude: string;
  wednesdayDate: string;
  group: string | null;
}

const NOISY_LE_GRAND = { lat: 48.8405, lng: 2.5537 };
const RADIUS_KM = 40;

// Color map for groups
const getGroupColor = (group: string | null) => {
  if (!group) return { circle: '#22c55e', arrow: '#16a34a', text: '#000000' }; // Default green
  const groupNum = group.replace('Groupe ', '');
  switch (groupNum) {
    case '1':
      return { circle: '#22c55e', arrow: '#16a34a', text: '#000000' }; // Green
    case '2':
      return { circle: '#facc15', arrow: '#eab308', text: '#000000' }; // Yellow
    case '3':
      return { circle: '#fb923c', arrow: '#ea580c', text: '#000000' }; // Orange
    case '4':
      return { circle: '#ef4444', arrow: '#dc2626', text: '#ffffff' }; // Red
    default:
      return { circle: '#22c55e', arrow: '#16a34a', text: '#000000' }; // Default green
  }
};

// Create custom instructor marker icon - round with arrow
const createInstructorIcon = (name: string, group: string | null) => {
  const colors = getGroupColor(group);
  const shortName = name.substring(0, 6);
  
  // SVG marker: ROUND circle with arrow pointing down
  const svg = `<svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="20" r="16" fill="${colors.circle}" stroke="#ffffff" stroke-width="1.5"/>
    <text x="24" y="24" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="${colors.text}" font-weight="bold" font-family="Arial">${shortName}</text>
    <polygon points="24,36 16,52 32,52" fill="${colors.arrow}" stroke="#ffffff" stroke-width="1"/>
  </svg>`;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
  });
};

export default function Localisation() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleBackClick = () => {
    window.history.back();
  };
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  const { data: instructorsData } = useQuery({
    queryKey: ['/api/planning/instructors-location', isWednesdaySchedule],
    queryFn: async () => {
      const today = new Date();
      const wednesdayDate = new Date(today);
      wednesdayDate.setDate(today.getDate() + (3 - today.getDay() + 7) % 7);
      const dateStr = wednesdayDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/planning/instructors-location/${dateStr}`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const data = await response.json();
      
      // If Wednesday 14h-18h schedule is active, filter only present instructors
      if (isWednesdaySchedule && data.instructors) {
        data.instructors = data.instructors.filter((inst: any) => inst.status === 'present');
      }
      
      return data;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([NOISY_LE_GRAND.lat, NOISY_LE_GRAND.lng], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Circle for 40km radius
      L.circle([NOISY_LE_GRAND.lat, NOISY_LE_GRAND.lng], RADIUS_KM * 1000, {
        color: '#ffff00',
        fillColor: '#ffff00',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(mapRef.current);

      // Mark Noisy-le-Grand
      L.marker([NOISY_LE_GRAND.lat, NOISY_LE_GRAND.lng], {
        title: 'Noisy-le-Grand',
      }).addTo(mapRef.current).bindPopup('Noisy-le-Grand');
    }

    return () => {
      if (mapRef.current && !containerRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add instructors to map
  useEffect(() => {
    if (!mapRef.current || !instructorsData?.instructors) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    instructorsData.instructors.forEach((instructor: InstructorLocation) => {
      const lat = parseFloat(instructor.latitude);
      const lng = parseFloat(instructor.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const icon = createInstructorIcon(instructor.name, instructor.group);
        const marker = L.marker([lat, lng], {
          icon,
          title: instructor.name,
        }).addTo(mapRef.current!);

        // Bind popup with phone only
        marker.bindPopup(`
          <div class="text-center" style="min-width: 140px;">
            ${instructor.phone ? `<a href="tel:${instructor.phone}" style="display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: bold;">📞 ${instructor.phone}</a>` : '<p style="color: white;">Pas de téléphone</p>'}
          </div>
        `);

        markersRef.current.push(marker);
      }
    });
  }, [instructorsData?.instructors]);

  // Get user location with 30-second refresh
  useEffect(() => {
    const updateLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            if (mapRef.current) {
              // Remove old marker if exists
              if (userMarkerRef.current) {
                userMarkerRef.current.remove();
              }
              
              // Add new marker
              userMarkerRef.current = L.marker([latitude, longitude], {
                title: 'Votre position',
                icon: L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQyIDAtOC0zLjU4LTgtOHMzLjU4LTggOC04IDggMy41OCA4IDgtMy41OCA4LTggOHptMy41LTljLjgzIDAgMS41LS42NyAxLjUtMS41cy0uNjctMS41LTEuNS0xLjUtMS41LjY3LTEuNSAxLjUuNjcgMS41IDEuNSAxLjV6Ii8+PC9zdmc+',
                  iconSize: [24, 24],
                  className: 'text-blue-500'
                })
              }).addTo(mapRef.current).bindPopup('Votre position');
            }
          },
          (error) => {
            console.error('Erreur de géolocalisation:', error);
            toast({
              title: 'Géolocalisation',
              description: 'Impossible d\'obtenir votre position',
              variant: 'destructive',
            });
          }
        );
      }
    };

    // Initial location fetch
    updateLocation();

    // Set up 30-second refresh interval
    const interval = setInterval(updateLocation, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  const instructors = instructorsData?.instructors || [];

  return (
    <div className="min-h-screen">
      <PageHeader title="Localisation" subtitle="Encadrants présents ce mercredi" />

      <main className="container mx-auto px-4 py-8 relative">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="page-title">
                Localisation des Encadrants
              </h1>
              <p className="text-muted-foreground text-sm">
                Rayon: 40 km autour de Noisy-le-Grand • {instructors.length} encadrant(s) présent(s)
                {isWednesdaySchedule && ' • Mode mercredi 14h-18h activé'}
              </p>
              <p className="text-xs text-green-300 mt-1">
                Position GPS actualisée toutes les 30 secondes
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={handleBackClick}
              className="absolute top-4 left-4 z-50 bg-background/80 hover:bg-background border border-primary rounded-lg p-2 transition-colors hover-elevate"
              data-testid="button-back-map"
              title="Retour"
            >
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              ref={containerRef}
              className="w-full rounded-lg overflow-hidden border-2 border-primary"
              data-testid="map-container"
              style={{ minHeight: '500px', marginRight: '60px' }}
            />
          </div>

          {instructors.length > 0 && (
            <Card className="p-4" data-testid="instructors-list">
              <h2 className="text-lg font-bold text-white mb-3">Encadrants (14h-18h)</h2>
              <div className="space-y-2">
                {instructors.map((instructor: InstructorLocation) => (
                  <div
                    key={instructor.id}
                    onClick={() => navigate(`/encadrants/${instructor.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/40 hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`instructor-${instructor.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {instructor.photoUrl && (
                        <div className="relative">
                          <img
                            src={instructor.photoUrl}
                            alt={instructor.name}
                            className="w-12 h-12 rounded-md object-cover border-2 border-yellow-400"
                            data-testid={`photo-${instructor.id}`}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{instructor.name}</p>
                        {instructor.phone && (
                          <a
                            href={`tel:${instructor.phone}`}
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {instructor.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {instructors.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucun encadrant présent ce mercredi</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
