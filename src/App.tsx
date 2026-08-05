import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { LocateFixed, Megaphone } from 'lucide-react';
import { SearchPanel } from './components/SearchPanel';
import { RouteResultPanel } from './components/RouteResultPanel';
import { NavOverlay } from './components/NavOverlay';
import { ReportModal } from './components/ReportModal';
import { ReportListModal } from './components/ReportListModal';
import { PermissionModal } from './components/PermissionModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FacilityFilterBar } from './components/FacilityFilterBar';
import { TransitOption, AccessibilityFacility, FacilityCategory, ObstacleReport, Coordinates } from './types';
import { speak } from './utils/speech';

// Custom Leaflet Icons
const startIcon = L.divIcon({
  html: '<div class="text-blue-600 text-4xl drop-shadow-lg" style="margin-top:-10px;"><i class="fa-solid fa-location-dot"></i></div>',
  className: 'bg-transparent',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const endIcon = L.divIcon({
  html: '<div class="text-red-500 text-4xl drop-shadow-lg" style="margin-top:-10px;"><i class="fa-solid fa-flag-checkered"></i></div>',
  className: 'bg-transparent',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const myLocationIcon = L.divIcon({
  html: '<div class="pulse-marker w-6 h-6"></div>',
  className: 'bg-transparent',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Barrier-Free Facility Custom Icons
const elevIcon = L.divIcon({
  html: '<div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-elevator"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const escalaIcon = L.divIcon({
  html: '<div class="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-stairs"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const slopeIconGentle = L.divIcon({
  html: '<div class="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-angle-up"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const slopeIconModerate = L.divIcon({
  html: '<div class="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-angle-up"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const warnIcon = L.divIcon({
  html: '<div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-triangle-exclamation"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const brailleIcon = L.divIcon({
  html: '<div class="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-braille"></i></div>',
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function App() {
  // Map and markers refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const currentPosMarkerRef = useRef<L.Marker | null>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const facilityMarkersRef = useRef<L.Marker[]>([]);
  const reportMarkersRef = useRef<L.Marker[]>([]);
  const navWatchIdRef = useRef<number | null>(null);

  // Coordinates state
  const [startCoords, setStartCoords] = useState<L.LatLng | null>(null);
  const [endCoords, setEndCoords] = useState<L.LatLng | null>(null);
  const [currentCoords, setCurrentCoords] = useState<L.LatLng | null>(null);

  // Community Reports State
  const [reports, setReports] = useState<ObstacleReport[]>([
    {
      id: 'rep-1',
      latlng: { lat: 37.5559, lng: 126.9723 },
      locationName: '서울역 1번 출구 엘리베이터 앞',
      status: 'no',
      issueType: '엘리베이터 고장/미작동',
      description: '엘리베이터 정기 점검 중으로 운영 중단됨. 2번 출구 측 엘리베이터 이용 권장합니다.',
      nickname: '따뜻한휠체어',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes: 14,
    },
    {
      id: 'rep-2',
      latlng: { lat: 37.5662, lng: 126.9778 },
      locationName: '시청역 2번 출구 보입 진입로',
      status: 'no',
      issueType: '높은 단차/계단 있음',
      description: '횡단보도 앞 경계석 단차가 약 4cm 정도로 수동휠체어 넘어짐 주의 필요.',
      nickname: '배리어프리나비',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      likes: 8,
    },
    {
      id: 'rep-3',
      latlng: { lat: 37.5701, lng: 126.991 },
      locationName: '종로3가역 3번 출구 엘리베이터',
      status: 'yes',
      issueType: '기타 편의시설 설치완료',
      description: '신규 엘리베이터 공사 완료 후 정상 가동 시작! 승강장 직통이라 매우 편리함.',
      nickname: '모두의길',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      likes: 23,
    },
    {
      id: 'rep-4',
      latlng: { lat: 37.5609, lng: 126.9863 },
      locationName: '명동역 5번 출구 앞 보도',
      status: 'no',
      issueType: '통행 방해물/무단주차',
      description: '상가 자재 불법 적재로 보도 폭 80cm 이하 축소됨. 우회 필요.',
      nickname: '안전보행',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      likes: 5,
    },
  ]);

  // Input state
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(false);
  const [transitOptions, setTransitOptions] = useState<TransitOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('subway');
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'all'>('all');
  const [activeFacilities, setActiveFacilities] = useState<AccessibilityFacility[]>([]);

  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [directionText, setDirectionText] = useState('직진하세요');
  const [subText, setSubText] = useState('다음: 엘리베이터 탑승');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportListModalOpen, setIsReportListModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Helper: Toast display
  const showToast = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Update current location marker on map
  const updateCurrentLocationMarker = useCallback((latlng: L.LatLng) => {
    if (!mapRef.current) return;
    if (currentPosMarkerRef.current) {
      currentPosMarkerRef.current.setLatLng(latlng);
    } else {
      currentPosMarkerRef.current = L.marker(latlng, {
        icon: myLocationIcon,
        zIndexOffset: 1000,
      }).addTo(mapRef.current);
    }
  }, []);

  // Clear map routes and facility markers
  const clearRoutes = useCallback(() => {
    if (!mapRef.current) return;
    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];
    setActiveFacilities([]);
  }, []);

  // Set Start or End marker
  const setMarker = useCallback(
    (type: 'start' | 'end', latlng: L.LatLng) => {
      if (!mapRef.current) return;

      if (type === 'start') {
        if (startMarkerRef.current) startMarkerRef.current.remove();
        startMarkerRef.current = L.marker(latlng, {
          icon: startIcon,
          zIndexOffset: 500,
        }).addTo(mapRef.current);
        setStartCoords(latlng);
      } else {
        if (endMarkerRef.current) endMarkerRef.current.remove();
        endMarkerRef.current = L.marker(latlng, {
          icon: endIcon,
          zIndexOffset: 500,
        }).addTo(mapRef.current);
        setEndCoords(latlng);
      }
    },
    []
  );

  // Render Facility Markers on Map according to active filter
  const renderFacilityMarkers = useCallback((facilities: AccessibilityFacility[], filter: FacilityCategory | 'all') => {
    if (!mapRef.current) return;

    // Remove existing facility markers
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    const filtered = filter === 'all' ? facilities : facilities.filter((f) => f.category === filter);

    filtered.forEach((fac) => {
      let icon = elevIcon;
      if (fac.category === 'escalator') icon = escalaIcon;
      else if (fac.category === 'slope') {
        icon = fac.slopeGrade === 'steep' || fac.slopeGrade === 'moderate' ? slopeIconModerate : slopeIconGentle;
      } else if (fac.category === 'obstacle') icon = warnIcon;
      else if (fac.category === 'braille') icon = brailleIcon;

      const marker = L.marker([fac.latlng.lat, fac.latlng.lng], { icon, zIndexOffset: 800 })
        .bindPopup(`
          <div class="p-1 max-w-[220px]">
            <div class="font-bold text-sm text-gray-900 mb-1 flex items-center gap-1">
              ${fac.name}
            </div>
            <div class="text-xs text-blue-600 font-semibold mb-1 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
              ${fac.status}
            </div>
            <div class="text-xs text-gray-600 leading-relaxed">
              ${fac.description}
            </div>
          </div>
        `)
        .addTo(mapRef.current!);

      marker.on('click', () => {
        speak(`${fac.name}. ${fac.status}. ${fac.description}`);
      });

      facilityMarkersRef.current.push(marker);
    });
  }, []);

  // Render Community Reports on Map
  const renderReportMarkers = useCallback((reportList: ObstacleReport[]) => {
    if (!mapRef.current) return;

    reportMarkersRef.current.forEach((m) => m.remove());
    reportMarkersRef.current = [];

    reportList.forEach((rep) => {
      const isObstacle = rep.status === 'no';
      const icon = isObstacle
        ? warnIcon
        : L.divIcon({
            html: '<div class="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-md text-sm"><i class="fa-solid fa-check"></i></div>',
            className: 'bg-transparent',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

      const marker = L.marker([rep.latlng.lat, rep.latlng.lng], { icon, zIndexOffset: 900 })
        .bindPopup(`
          <div class="p-1.5 max-w-[240px]">
            <div class="font-extrabold text-xs text-gray-900 mb-1 flex items-center justify-between gap-1">
              <span class="truncate">📍 ${rep.locationName}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-extrabold shrink-0 ${
                isObstacle ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }">
                ${isObstacle ? '불편' : '원활'}
              </span>
            </div>
            ${
              rep.issueType
                ? `<div class="text-[11px] font-bold text-blue-600 mb-1">${rep.issueType}</div>`
                : ''
            }
            ${
              rep.description
                ? `<div class="text-[11px] text-gray-700 leading-snug mb-1.5 bg-gray-50 p-1.5 rounded border border-gray-100">${rep.description}</div>`
                : ''
            }
            <div class="text-[10px] text-gray-500 mt-1 flex justify-between items-center pt-1 border-t border-gray-100">
              <span>제보자: ${rep.nickname || '익명'}</span>
              <span class="font-bold text-amber-600">👍 ${rep.likes || 0}</span>
            </div>
          </div>
        `)
        .addTo(mapRef.current!);

      marker.on('click', () => {
        speak(
          `${rep.locationName}. ${isObstacle ? '장애물 불편 제보' : '원활 제보'}. ${rep.issueType || ''}. ${
            rep.description || ''
          }`
        );
      });

      reportMarkersRef.current.push(marker);
    });
  }, []);

  // Sync report markers when reports array changes
  useEffect(() => {
    if (mapRef.current) {
      renderReportMarkers(reports);
    }
  }, [reports, renderReportMarkers]);

  // Handle Geolocation Error
  const handleLocationError = useCallback(
    (error: GeolocationPositionError, isAutoLoad: boolean) => {
      if (error.code === 1) {
        setIsPermissionModalOpen(true);
        if (!isAutoLoad) {
          speak('위치 권한이 차단되어 있습니다. 화면의 안내에 따라 권한을 허용해 주세요.');
        }
      } else {
        if (!isAutoLoad) {
          showToast(`미리보기 환경 보안 정책으로 실제 위치를 차단 중입니다.<br>테스트 위치로 이동합니다.`);
          speak('미리보기 샌드박스 환경으로 인해 테스트 위치로 이동합니다.');

          setTimeout(() => {
            const mockLatlng = L.latLng(37.5665, 126.9780); // 서울시청 주변
            setCurrentCoords(mockLatlng);
            updateCurrentLocationMarker(mockLatlng);
            setMarker('start', mockLatlng);
            setStartInput('(테스트 환경) 가상 위치');
            if (mapRef.current) mapRef.current.flyTo(mockLatlng, 16);
          }, 1500);
        }
      }
    },
    [showToast, updateCurrentLocationMarker, setMarker]
  );

  // Get Current GPS Location
  const getCurrentLocation = useCallback(
    (moveMap = false, isAutoLoad = false) => {
      if (!navigator.geolocation) {
        return showToast('이 브라우저에서는 위치 기능을 지원하지 않습니다.');
      }

      if (!isAutoLoad) {
        showToast("<i class='fa-solid fa-satellite-dish fa-beat mr-2'></i>현재 위치를 찾고 있습니다...");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = L.latLng(lat, lng);

          setCurrentCoords(latlng);
          updateCurrentLocationMarker(latlng);

          if (!startCoords || !isNavigating) {
            setMarker('start', latlng);
            setStartInput('내 현재 위치');
          }

          if (moveMap && mapRef.current) {
            mapRef.current.flyTo(latlng, 17, { animate: true, duration: 1 });
          }

          if (!isAutoLoad) showToast('현재 위치를 확인했습니다.');
        },
        (error) => handleLocationError(error, isAutoLoad),
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    },
    [showToast, isNavigating, startCoords, updateCurrentLocationMarker, setMarker, handleLocationError]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(
      [37.5665, 126.9780],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Prevent map container render glitches in iFrame
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Initial greeting & geolocation call
    setTimeout(() => {
      showToast('스마트 무장애 교통안내 맵에 오신 것을 환영합니다.');
      getCurrentLocation(true, true);
    }, 500);
  }, [getCurrentLocation, showToast]);

  // Bind map click events
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isNavigating) return;

      if (!startCoords) {
        setMarker('start', e.latlng);
        setStartInput('지도에서 출발지 지정됨');
        showToast('출발지가 설정되었습니다.');
      } else if (!endCoords) {
        setMarker('end', e.latlng);
        setEndInput('지도에서 도착지 지정됨');
        showToast('도착지가 설정되었습니다. 경로 탐색을 눌러주세요.');
      } else {
        setMarker('start', e.latlng);
        setStartInput('지도에서 출발지 지정됨');
        clearRoutes();
        showToast('출발지가 재설정되었습니다.');
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isNavigating, startCoords, endCoords, setMarker, clearRoutes, showToast]);

  // Handle Category Filter Change
  const handleCategoryFilter = (cat: FacilityCategory | 'all') => {
    setSelectedCategory(cat);
    renderFacilityMarkers(activeFacilities, cat);
  };

  // Focus specific facility on map
  const handleFocusFacility = (facility: AccessibilityFacility) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([facility.latlng.lat, facility.latlng.lng], 18, { animate: true, duration: 1 });
    speak(`${facility.name}. ${facility.status}. ${facility.description}`);

    // Find and open popup for this facility
    const targetMarker = facilityMarkersRef.current.find((m) => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - facility.latlng.lat) < 0.0001 && Math.abs(pos.lng - facility.latlng.lng) < 0.0001;
    });

    if (targetMarker) {
      targetMarker.openPopup();
    }
  };

  // Search Place using Nominatim
  const searchPlace = async (type: 'start' | 'end') => {
    const query = type === 'start' ? startInput : endInput;
    if (!query.trim()) {
      showToast('검색어를 입력해주세요.');
      return;
    }

    showToast("<i class='fa-solid fa-spinner fa-spin mr-2'></i>장소를 검색 중입니다...");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=kr`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const latlng = L.latLng(data[0].lat, data[0].lon);
        setMarker(type, latlng);
        if (mapRef.current) mapRef.current.flyTo(latlng, 16, { duration: 1.5 });

        const shortName = data[0].display_name.split(',')[0];
        if (type === 'start') setStartInput(shortName);
        else setEndInput(shortName);

        showToast(`'${shortName}' 위치를 찾았습니다.`);
      } else {
        showToast('검색 결과가 없습니다. 다른 검색어나 지도를 터치해주세요.');
      }
    } catch {
      showToast('검색 중 오류가 발생했습니다.');
    }
  };

  // Find Route using OSRM
  const findRoute = async () => {
    if (!startCoords || !endCoords) {
      showToast('출발지와 도착지를 모두 설정해주세요.');
      speak('출발지와 도착지를 지정해주세요.');
      return;
    }

    setIsLoadingRoute(true);
    showToast("<i class='fa-solid fa-spinner fa-spin mr-2'></i>대중교통 경로를 분석 중입니다...");

    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('경로 없음');
      }

      clearRoutes();

      const routeCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );
      const totalDistMeters: number = data.routes[0].distance;

      if (!mapRef.current) return;

      if (totalDistMeters > 1000) {
        const walkIdx = Math.floor(routeCoords.length * 0.2);
        const rideIdx = Math.floor(routeCoords.length * 0.8);

        const walk1 = L.polyline(routeCoords.slice(0, walkIdx + 1), {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
        }).addTo(mapRef.current);

        const transit = L.polyline(routeCoords.slice(walkIdx, rideIdx + 1), {
          color: '#10b981',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(mapRef.current);

        const walk2 = L.polyline(routeCoords.slice(rideIdx), {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
        }).addTo(mapRef.current);

        routeLayersRef.current.push(walk1, transit, walk2);
      } else {
        const walk = L.polyline(routeCoords, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
        }).addTo(mapRef.current);

        routeLayersRef.current.push(walk);
      }

      mapRef.current.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50] });

      // Generate transit options data along with detailed facility markers
      generateTransitOptions(totalDistMeters, routeCoords);

      setIsRoutePanelOpen(true);
      speak('경로 탐색을 완료했습니다. 엘리베이터, 경사도, 장애물 정보가 포함된 무장애 경로를 확인하세요.');
    } catch {
      showToast('경로를 찾을 수 없습니다.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Generate mock transit option items & route facilities
  const generateTransitOptions = (distMeters: number, routeCoords: [number, number][]) => {
    const isFar = distMeters > 1000;

    // Pick points along routeCoords for realistic facility positioning
    const len = routeCoords.length;
    const p1 = routeCoords[Math.floor(len * 0.15)] || [37.5665, 126.978];
    const p2 = routeCoords[Math.floor(len * 0.35)] || [37.567, 126.979];
    const p3 = routeCoords[Math.floor(len * 0.55)] || [37.5675, 126.98];
    const p4 = routeCoords[Math.floor(len * 0.75)] || [37.568, 126.981];
    const p5 = routeCoords[Math.floor(len * 0.9)] || [37.5685, 126.982];

    const facilitiesSubway: AccessibilityFacility[] = [
      {
        id: 'fac-1',
        category: 'elevator',
        name: '승차역 1번 출구 엘리베이터',
        latlng: { lat: p1[0], lng: p1[1] },
        status: '정상 운행중',
        description: '지상 1층 ↔ 지하 2층 대합실 직통, 휠체어 전용 낮은 조작반 완비',
      },
      {
        id: 'fac-2',
        category: 'escalator',
        name: '대합실 에스컬레이터 (1호기)',
        latlng: { lat: p2[0], lng: p2[1] },
        status: '상행 전용 운행',
        description: '지하 2층 ↔ 지하 1층, 핸드레일 소독기 탑재 및 음성 안내',
      },
      {
        id: 'fac-3',
        category: 'slope',
        name: '연결보행로 경사 구간',
        latlng: { lat: p3[0], lng: p3[1] },
        status: '경사도 2.1% (완만)',
        description: '완만한 경사로 수동/전동 휠체어 및 유모차 이동 용이',
        slopeGrade: 'gentle',
      },
      {
        id: 'fac-4',
        category: 'braille',
        name: '승강장 점자안내판 & 연속 점자블록',
        latlng: { lat: p4[0], lng: p4[1] },
        status: '정상 설치됨',
        description: '시각장애인용 음성안내 버튼 연동 및 점자 가이드',
      },
      {
        id: 'fac-5',
        category: 'elevator',
        name: '하차역 3번 출구 엘리베이터',
        latlng: { lat: p5[0], lng: p5[1] },
        status: '정상 운행중',
        description: '승강장 ↔ 지상 출구 직접 연결',
      },
    ];

    const facilitiesBus: AccessibilityFacility[] = [
      {
        id: 'fac-bus-1',
        category: 'slope',
        name: '정류장 진입 보도 경사',
        latlng: { lat: p1[0], lng: p1[1] },
        status: '경사도 1.8% (완만)',
        description: '턱 없는 평지형 보행로, 유모차 및 휠체어 통행 자유',
        slopeGrade: 'gentle',
      },
      {
        id: 'fac-bus-2',
        category: 'braille',
        name: '버스정류장 점자안내판',
        latlng: { lat: p2[0], lng: p2[1] },
        status: '음성안내 지원',
        description: '실시간 버스 도착 정보 음성 안내기 설치 구역',
      },
      {
        id: 'fac-bus-3',
        category: 'obstacle',
        name: '횡단보도 진입 보도 단차',
        latlng: { lat: p4[0], lng: p4[1] },
        status: '단차 2.5cm 주의',
        description: '횡단보도 경계석 낮춤 시공 구역 (턱 낮음)',
      },
    ];

    const facilitiesWalk: AccessibilityFacility[] = [
      {
        id: 'fac-walk-1',
        category: 'slope',
        name: '보행로 전체 경사도',
        latlng: { lat: p2[0], lng: p2[1] },
        status: '평균 경사도 1.5%',
        description: '계단이 전혀 없는 평지 보행로',
        slopeGrade: 'gentle',
      },
      {
        id: 'fac-walk-2',
        category: 'braille',
        name: '보행로 점자블록 구간',
        latlng: { lat: p3[0], lng: p3[1] },
        status: '연속 설치',
        description: '보도 중앙 시각장애인 유도점자블록 연속 설치',
      },
      {
        id: 'fac-walk-3',
        category: 'obstacle',
        name: '소형 단차 구역',
        latlng: { lat: p4[0], lng: p4[1] },
        status: '단차 1.5cm',
        description: '휠체어 슬로프 경사 보완 구역',
      },
    ];

    if (isFar) {
      const timeSub = Math.round(distMeters / 600) + 15;
      const timeBus = timeSub + 8;

      const options: TransitOption[] = [
        {
          id: 'subway',
          type: 'subway',
          title: '지하철 위주',
          timeMinutes: timeSub,
          cost: '1,400원',
          badge: '지하철 위주',
          badgeColor: 'bg-blue-600',
          steps: [
            { icon: 'foot', text: '도보 5분' },
            { icon: 'subway', text: '1호선 탑승' },
            { icon: 'foot', text: '도보 4분' },
          ],
          features: ['엘리베이터 2개소', '에스컬레이터 1개소', '완만 경사 2.1%', '점자판 연동'],
          facilities: facilitiesSubway,
          detailedLegs: [
            {
              id: 'leg-sub-1',
              type: 'walk',
              title: '출발지 → 시청역 1번 출구 도보 이동',
              subtitle: '약 280m (약 4분 소요)',
              description: '계단이 전혀 없는 평탄한 보도를 통해 이동합니다.',
              locationName: '출발지',
              facilitiesIncluded: {
                brailleInfo: '보도 중앙 시각장애인 유도 점자블록 연속 설치',
              },
            },
            {
              id: 'leg-sub-2',
              type: 'elevator',
              title: '시청역 1번 출구 엘리베이터 이용 지하 대합실 이동',
              subtitle: '지상 1층 ↔ 지하 2층 직통',
              locationName: '시청역 1번 출구',
              exitNumber: '1번 출구',
              facilitiesIncluded: {
                elevatorName: '시청역 1호기 엘리베이터',
                elevatorStatus: '정상 운행중',
                brailleInfo: '엘리베이터 버튼 점자 및 음성 안내 연동',
              },
            },
            {
              id: 'leg-sub-3',
              type: 'transit_ride',
              title: '수도권 1호선 탑승 (소요산/청량리 방면)',
              subtitle: '2개 역 이동 (약 6분 소요)',
              transitLineName: '수도권 1호선',
              lineColor: 'bg-blue-600 text-white',
              locationName: '시청역 승강장',
              passedStations: ['시청역 (승차)', '종각역 (경유)', '종로3가역 (하차)'],
              wheelchairPosition: '휠체어/유모차 전용 탑승위치 1-1 및 10-4',
              description: '전동차-승강장 간격 5cm 이내로 휠체어 안전 탑승 가능 구역',
            },
            {
              id: 'leg-sub-4',
              type: 'alight',
              title: '종로3가역 하차 및 3번 출구 엘리베이터 이용 지상 이동',
              subtitle: '지하 2층 승강장 ↔ 지상 1층 직통',
              locationName: '종로3가역',
              exitNumber: '3번 출구',
              facilitiesIncluded: {
                elevatorName: '종로3가역 3번 출구 엘리베이터',
                elevatorStatus: '정상 운행중',
                brailleInfo: '하차 게이트 점자판 및 촉지도 안내',
              },
            },
            {
              id: 'leg-sub-5',
              type: 'walk',
              title: '종로3가역 3번 출구 → 목적지 도착',
              subtitle: '약 210m (약 3분 소요)',
              description: '횡단보도 경계석 턱 낮춤 시공 완료 구간 (단차 1.5cm 미만)',
              locationName: '목적지',
            },
          ],
        },
        {
          id: 'bus',
          type: 'bus',
          title: '저상버스',
          timeMinutes: timeBus,
          cost: '1,500원',
          badge: '저상버스',
          badgeColor: 'bg-emerald-600',
          arrivalTime: '약 3분 후 도착',
          steps: [
            { icon: 'foot', text: '도보 3분' },
            { icon: 'bus', text: '간선 143' },
            { icon: 'foot', text: '도보 7분' },
          ],
          features: ['경사로 전개 가능', '버스 점자판', '보도 단차 2.5cm'],
          facilities: facilitiesBus,
          detailedLegs: [
            {
              id: 'leg-bus-1',
              type: 'walk',
              title: '출발지 → 시청.덕수궁 버스정류장 이동',
              subtitle: '약 180m (약 3분 소요)',
              description: '평지 보행로 이용',
              locationName: '출발지',
            },
            {
              id: 'leg-bus-2',
              type: 'transit_ride',
              title: '간선 143번 (저상버스) 탑승',
              subtitle: '3개 정류장 이동 (약 9분 소요)',
              transitLineName: '간선 143번',
              lineColor: 'bg-emerald-600 text-white',
              locationName: '시청.덕수궁 정류장 (ID: 02-132)',
              passedStations: ['시청.덕수궁 (승차)', '롯데백화점 (경유)', '명동입구 (경유)', '퇴계로2가.명동역 (하차)'],
              wheelchairPosition: '중문 휠체어 슬로프 리프트 자동 탑재',
              facilitiesIncluded: {
                brailleInfo: '정류장 실시간 버스도착안내 단말기 음성안내 연동',
              },
            },
            {
              id: 'leg-bus-3',
              type: 'alight',
              title: '퇴계로2가.명동역 정류장 하차',
              locationName: '퇴계로2가.명동역 정류장',
              description: '하차 시 기사님 휠체어 발판 리프트 보조',
            },
            {
              id: 'leg-bus-4',
              type: 'walk',
              title: '정류장 → 목적지 최종 이동',
              subtitle: '약 320m (약 5분 소요)',
              description: '보행로 경사도 1.8% 완만 구간',
              locationName: '목적지',
            },
          ],
        },
      ];
      setTransitOptions(options);
      setSelectedOptionId('subway');
      setActiveFacilities(facilitiesSubway);
      renderFacilityMarkers(facilitiesSubway, selectedCategory);
    } else {
      const timeWalk = Math.max(3, Math.ceil(distMeters / 50));
      const options: TransitOption[] = [
        {
          id: 'walk',
          type: 'walk',
          title: '무장애 도보',
          timeMinutes: timeWalk,
          cost: '무료',
          badge: '무장애 도보',
          badgeColor: 'bg-gray-600',
          steps: [
            { icon: 'foot', text: `총 거리: ${Math.round(distMeters)}m (계단, 턱 없는 경로)` },
          ],
          features: ['완만한 경사(1.5%)', '연속 점자블록', '단차 최소화'],
          facilities: facilitiesWalk,
          detailedLegs: [
            {
              id: 'leg-walk-1',
              type: 'walk',
              title: '출발지 → 보도 진입로',
              subtitle: '평지 구간 (경사 1.0%)',
              description: '턱이 없으며 휠체어 및 유모차 교행 가능한 2m 폭 보도',
              locationName: '출발지',
            },
            {
              id: 'leg-walk-2',
              type: 'braille',
              title: '중앙 보행로 점자블록 가이드 구간',
              subtitle: '연속 설치 구간',
              description: '시각장애인 유도점자블록을 따라 직선 이동',
              facilitiesIncluded: {
                brailleInfo: '선형 점자블록 및 횡단보도 앞 점형 점자블록',
              },
            },
            {
              id: 'leg-walk-3',
              type: 'walk',
              title: '횡단보도 단차 낮춤 구간 → 목적지 도착',
              subtitle: '단차 1.5cm 안전 통과',
              description: '목적지 건물 1층 경사로와 직접 연결',
              locationName: '목적지',
            },
          ],
        },
      ];
      setTransitOptions(options);
      setSelectedOptionId('walk');
      setActiveFacilities(facilitiesWalk);
      renderFacilityMarkers(facilitiesWalk, selectedCategory);
    }
  };

  // Handle Option Select inside drawer
  const handleSelectOption = (id: string) => {
    setSelectedOptionId(id);
    const opt = transitOptions.find((o) => o.id === id);
    if (opt && opt.facilities) {
      setActiveFacilities(opt.facilities);
      renderFacilityMarkers(opt.facilities, selectedCategory);
    }
  };

  // Start navigation mode
  const startNavigation = () => {
    if (!navigator.geolocation) {
      return showToast('GPS를 사용할 수 없어 안내를 시작할 수 없습니다.');
    }

    setIsNavigating(true);
    setIsRoutePanelOpen(false);

    speak('선택하신 경로로 대중교통 안내를 시작합니다. 첫 번째 목적지인 정류장을 향해 이동해 주세요.');

    navWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latlng = L.latLng(lat, lng);

        setCurrentCoords(latlng);
        updateCurrentLocationMarker(latlng);

        if (mapRef.current) {
          mapRef.current.flyTo(latlng, 18, { animate: true, duration: 1 });
        }

        if (endCoords && mapRef.current) {
          const dist = mapRef.current.distance(latlng, endCoords);
          if (dist < 20) {
            setDirectionText('목적지에 도착했습니다!');
            setSubText('안내를 종료합니다.');
            speak('목적지에 도착했습니다. 안내를 종료합니다.');
            stopNavigation();
          } else {
            setDirectionText(`목적지까지 ${Math.round(dist)}m`);
            if (dist > 500) setSubText('정류장/역으로 이동 중');
            else setSubText('목적지 방향으로 직진');
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Stop navigation mode
  const stopNavigation = () => {
    setIsNavigating(false);
    if (navWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(navWatchIdRef.current);
      navWatchIdRef.current = null;
    }

    if (mapRef.current) mapRef.current.setZoom(16);
    speak('안내를 종료합니다.');
  };

  // Handle Obstacle/Accessibility Report submission
  const handleSubmitReport = (
    status: 'yes' | 'no',
    nickname: string,
    issueType: string,
    locationName: string,
    coords: Coordinates,
    description?: string
  ) => {
    const newReport: ObstacleReport = {
      id: `rep-${Date.now()}`,
      latlng: coords,
      locationName: locationName || '제보 위치',
      status,
      nickname: nickname || '익명 제보자',
      issueType,
      description,
      timestamp: new Date().toISOString(),
      likes: 1,
    };

    setReports((prev) => [newReport, ...prev]);
    setIsReportModalOpen(false);

    showToast("<i class='fa-solid fa-check-circle text-green-400 mr-2'></i>위치 지정 제보가 등록되었습니다. 감사합니다!");
    speak(`${locationName}에 대한 제보가 성공적으로 등록되었습니다.`);

    if (mapRef.current) {
      mapRef.current.flyTo([coords.lat, coords.lng], 17, { animate: true, duration: 1 });
    }
  };

  // Fly to report position from "모아보기"
  const handleFocusReportOnMap = (report: ObstacleReport) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([report.latlng.lat, report.latlng.lng], 18, { animate: true, duration: 1 });

    const matchedMarker = reportMarkersRef.current.find((m) => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - report.latlng.lat) < 0.0001 && Math.abs(pos.lng - report.latlng.lng) < 0.0001;
    });

    if (matchedMarker) {
      setTimeout(() => matchedMarker.openPopup(), 600);
    }

    speak(`${report.locationName} 제보 위치로 이동했습니다.`);
  };

  // Like a report
  const handleLikeReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
    showToast('공감 표시가 등록되었습니다.');
  };

  // Compute count of active facilities by category
  const facilityCounts = activeFacilities.reduce(
    (acc, fac) => {
      acc[fac.category] = (acc[fac.category] || 0) + 1;
      return acc;
    },
    { elevator: 0, escalator: 0, slope: 0, obstacle: 0, braille: 0 } as Record<FacilityCategory, number>
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />

      {/* Top Search Bar & Facility Filter Chips */}
      {!isNavigating && (
        <div className="overlay-panel top-0 left-0 w-full p-4 bg-gradient-to-b from-white/95 via-white/80 to-transparent pointer-events-none z-[1000] flex flex-col gap-2">
          <div className="pointer-events-auto">
            <SearchPanel
              startInput={startInput}
              setStartInput={setStartInput}
              endInput={endInput}
              setEndInput={setEndInput}
              onSearchPlace={searchPlace}
              onGetCurrentLocation={() => getCurrentLocation(true)}
              onFindRoute={findRoute}
              isLoading={isLoadingRoute}
            />
          </div>

          {/* Barrier-free facility category quick filters */}
          <div className="pointer-events-auto max-w-lg mx-auto w-full">
            <FacilityFilterBar
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryFilter}
              counts={activeFacilities.length > 0 ? facilityCounts : undefined}
            />
          </div>
        </div>
      )}

      {/* Map Element */}
      <div id="map" ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Action Control Stack on Map */}
      {!isNavigating && (
        <div className="overlay-panel bottom-24 sm:bottom-28 right-4 flex flex-col gap-2.5 z-[1001] items-end">
          {/* 제보 모아보기 Floating Button */}
          <button
            onClick={() => setIsReportListModalOpen(true)}
            className="px-3.5 py-2.5 bg-gray-900 text-white rounded-2xl shadow-lg flex items-center gap-2 font-extrabold text-xs active:scale-95 transition border border-gray-700 hover:bg-gray-800"
            title="시민 제보 모아보기"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>제보 모아보기</span>
            <span className="bg-amber-500 text-gray-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
              {reports.length}
            </span>
          </button>

          {/* 위치선택 제보하기 Floating Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 text-white rounded-2xl shadow-lg flex items-center gap-2 font-extrabold text-xs active:scale-95 transition border border-amber-400 hover:bg-amber-600"
            title="위치 지정 제보하기"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>제보하기</span>
          </button>

          {/* Locate Me Floating Button */}
          <button
            onClick={() => getCurrentLocation(true)}
            className="w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center text-blue-600 active:bg-gray-100 transition border border-gray-100 hover:bg-gray-50"
            title="내 위치 찾기"
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bottom Route Options Drawer */}
      <RouteResultPanel
        isOpen={isRoutePanelOpen && !isNavigating}
        onClose={() => setIsRoutePanelOpen(false)}
        options={transitOptions}
        selectedOptionId={selectedOptionId}
        onSelectOption={handleSelectOption}
        onStartNavigation={startNavigation}
        onFocusFacility={handleFocusFacility}
      />

      {/* Active Navigation Mode Overlay */}
      <NavOverlay
        isNavigating={isNavigating}
        directionText={directionText}
        subText={subText}
        onStopNavigation={stopNavigation}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Report Obstacle Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentCoords={currentCoords ? { lat: currentCoords.lat, lng: currentCoords.lng } : null}
        startCoords={startCoords ? { lat: startCoords.lat, lng: startCoords.lng } : null}
        endCoords={endCoords ? { lat: endCoords.lat, lng: endCoords.lng } : null}
        startName={startInput}
        endName={endInput}
        onSubmitReport={handleSubmitReport}
      />

      {/* Report List Modal (모아보기) */}
      <ReportListModal
        isOpen={isReportListModalOpen}
        onClose={() => setIsReportListModalOpen(false)}
        reports={reports}
        onFocusReportOnMap={handleFocusReportOnMap}
        onLikeReport={handleLikeReport}
        onOpenNewReport={() => setIsReportModalOpen(true)}
      />

      {/* Location Permission Guidance Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
      />
    </div>
  );
}
