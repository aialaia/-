import React from 'react';
import { FacilityCategory } from '../types';
import { Strikethrough, AlertTriangle, Layers, Eye } from 'lucide-react';

interface FacilityFilterBarProps {
  selectedCategory: FacilityCategory | 'all';
  onSelectCategory: (cat: FacilityCategory | 'all') => void;
  counts?: Record<FacilityCategory, number>;
}

export const FacilityFilterBar: React.FC<FacilityFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: { id: FacilityCategory | 'all'; label: string; icon: string; color: string }[] = [
    { id: 'all', label: '전체 시설', icon: 'fa-solid fa-layer-group', color: 'bg-gray-800 text-white' },
    { id: 'elevator', label: '엘리베이터', icon: 'fa-solid fa-elevator', color: 'bg-blue-600 text-white' },
    { id: 'escalator', label: '에스컬레이터', icon: 'fa-solid fa-stairs', color: 'bg-indigo-600 text-white' },
    { id: 'slope', label: '경사정도', icon: 'fa-solid fa-angle-up', color: 'bg-emerald-600 text-white' },
    { id: 'obstacle', label: '장애물/턱', icon: 'fa-solid fa-triangle-exclamation', color: 'bg-red-500 text-white' },
    { id: 'braille', label: '점자판/블록', icon: 'fa-solid fa-braille', color: 'bg-amber-600 text-white' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-1 px-1 max-w-full">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = counts && cat.id !== 'all' ? counts[cat.id as FacilityCategory] : undefined;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs border ${
              isSelected
                ? `${cat.color} border-transparent ring-2 ring-offset-1 ring-blue-400`
                : 'bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200/80 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <i className={`${cat.icon} text-xs`} />
            <span>{cat.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
