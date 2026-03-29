export type AppSection = "upload" | "analysis" | "editor" | "gallery" | "export";

export interface FurnitureItem {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  realW: number;
  realH: number;
}

export interface SavedPlan {
  id: string;
  name: string;
  date: string;
  area: number;
  rooms: number;
}

export const FURNITURE_CATALOG = [
  { type: "sofa", label: "Диван", w: 90, h: 40, color: "#4f46e5", realW: 2.2, realH: 1.0, icon: "Armchair" },
  { type: "bed", label: "Кровать", w: 70, h: 80, color: "#7c3aed", realW: 1.8, realH: 2.0, icon: "BedDouble" },
  { type: "table", label: "Стол", w: 60, h: 40, color: "#0e7490", realW: 1.5, realH: 1.0, icon: "Table" },
  { type: "chair", label: "Стул", w: 35, h: 35, color: "#0369a1", realW: 0.5, realH: 0.5, icon: "Armchair" },
  { type: "wardrobe", label: "Шкаф", w: 80, h: 30, color: "#92400e", realW: 2.0, realH: 0.6, icon: "Square" },
  { type: "tv", label: "ТВ-стенд", w: 70, h: 25, color: "#1e3a5f", realW: 1.8, realH: 0.5, icon: "Monitor" },
  { type: "bathroom", label: "Ванна", w: 55, h: 35, color: "#065f46", realW: 1.7, realH: 0.8, icon: "Bath" },
  { type: "kitchen", label: "Кух. гарнитур", w: 100, h: 30, color: "#7c2d12", realW: 2.5, realH: 0.6, icon: "UtensilsCrossed" },
];

export const INITIAL_PLANS: SavedPlan[] = [
  { id: "p1", name: "Гостиная — ЖК Северный", date: "25 марта 2026", area: 34.2, rooms: 1 },
  { id: "p2", name: "Квартира-студия", date: "21 марта 2026", area: 28.7, rooms: 1 },
  { id: "p3", name: "Двухкомнатная на Ленина", date: "18 марта 2026", area: 58.1, rooms: 2 },
];

export const ANALYSIS_STEPS = [
  { label: "Декодирование 360° видео", icon: "Video" },
  { label: "Обнаружение стен и углов", icon: "ScanLine" },
  { label: "Построение геометрии комнаты", icon: "LayoutGrid" },
  { label: "Распознавание мебели", icon: "Boxes" },
  { label: "Расчёт масштаба и размеров", icon: "Ruler" },
  { label: "Генерация 2D плана", icon: "Map" },
];

export const ROOM_W = 380;
export const ROOM_H = 280;

export interface RoomDimensions {
  width: number;
  height: number;
}

export const DEFAULT_ROOM_DIMENSIONS: RoomDimensions = {
  width: 5.0,
  height: 4.0,
};