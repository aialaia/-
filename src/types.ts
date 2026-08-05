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
}

export interface ObstacleReport {
  id: string;
  latlng: Coordinates;
  status: 'yes' | 'no';
  nickname?: string;
  issueType?: string;
  timestamp: string;
}

export interface RouteData {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  isTransitRequired: boolean;
}
