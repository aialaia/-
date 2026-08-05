export interface Coordinates {
  lat: number;
  lng: number;
}

export type FacilityCategory = 'elevator' | 'escalator' | 'slope' | 'obstacle' | 'braille';

export interface AccessibilityFacility {
  id: string;
  category: FacilityCategory;
  name: string;
  latlng: Coordinates;
  status: string; // e.g., "정상 운행중", "경사도 2.1% (완만)", "보도 단차 3cm 주의"
  description: string;
  slopeGrade?: 'gentle' | 'moderate' | 'steep'; // 완만 / 보통 / 급경사
}

export interface RouteLegStep {
  id: string;
  type: 'walk' | 'elevator' | 'braille' | 'transit_ride' | 'alight';
  title: string;
  subtitle?: string;
  description?: string;
  locationName?: string;
  exitNumber?: string;
  lineColor?: string;
  transitLineName?: string;
  passedStations?: string[];
  wheelchairPosition?: string;
  facilitiesIncluded?: {
    elevatorName?: string;
    elevatorStatus?: string;
    brailleInfo?: string;
  };
}

export interface TransitOption {
  id: string;
  type: 'subway' | 'bus' | 'walk';
  title: string;
  timeMinutes: number;
  cost: string;
  badge: string;
  badgeColor: string;
  steps: {
    icon: string;
    text: string;
  }[];
  features: string[];
  arrivalTime?: string;
  facilities?: AccessibilityFacility[];
  detailedLegs?: RouteLegStep[];
}

export interface ObstacleReport {
  id: string;
  latlng: Coordinates;
  locationName: string;
  status: 'yes' | 'no'; // 'yes': 원활/개선됨, 'no': 불편/장애물
  nickname?: string;
  issueType?: string;
  description?: string;
  timestamp: string;
  likes?: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  isTransitRequired: boolean;
}
