import { useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import { FurnitureItem, FURNITURE_CATALOG, ROOM_W, ROOM_H, RoomDimensions, DEFAULT_ROOM_DIMENSIONS } from "./types";

interface EditorSectionProps {
  furniture: FurnitureItem[];
  setFurniture: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
  selectedItem: string | null;
  setSelectedItem: (id: string | null) => void;
  draggingItem: { id: string; startX: number; startY: number; origX: number; origY: number } | null;
  setDraggingItem: React.Dispatch<React.SetStateAction<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>>;
  roomDimensions: RoomDimensions;
  setRoomDimensions: React.Dispatch<React.SetStateAction<RoomDimensions>>;
}

export function EditorSection({
  furniture,
  setFurniture,
  selectedItem,
  setSelectedItem,
  draggingItem,
  setDraggingItem,
  roomDimensions,
  setRoomDimensions,
}: EditorSectionProps) {
  const [dimInput, setDimInput] = useState({ width: String(roomDimensions.width), height: String(roomDimensions.height) });
  const [dimEditing, setDimEditing] = useState(false);

  const scaleX = ROOM_W / roomDimensions.width;
  const scaleY = ROOM_H / roomDimensions.height;

  const roomAreaReal = roomDimensions.width * roomDimensions.height;
  const furnitureArea = furniture.reduce((sum, f) => sum + f.realW * f.realH, 0);

  const applyDimensions = () => {
    const newW = Math.max(1, Math.min(50, parseFloat(dimInput.width) || roomDimensions.width));
    const newH = Math.max(1, Math.min(50, parseFloat(dimInput.height) || roomDimensions.height));

    const oldScaleX = ROOM_W / roomDimensions.width;
    const oldScaleY = ROOM_H / roomDimensions.height;
    const newScaleX = ROOM_W / newW;
    const newScaleY = ROOM_H / newH;

    setFurniture((prev) =>
      prev.map((f) => ({
        ...f,
        x: Math.max(0, Math.min(ROOM_W - (f.realW * newScaleX), (f.x / oldScaleX) * newScaleX)),
        y: Math.max(0, Math.min(ROOM_H - (f.realH * newScaleY), (f.y / oldScaleY) * newScaleY)),
        w: f.realW * newScaleX,
        h: f.realH * newScaleY,
      }))
    );

    setRoomDimensions({ width: newW, height: newH });
    setDimInput({ width: String(newW), height: String(newH) });
    setDimEditing(false);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItem(id);
    const item = furniture.find((f) => f.id === id)!;
    setDraggingItem({ id, startX: e.clientX, startY: e.clientY, origX: item.x, origY: item.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingItem) return;
    const dx = e.clientX - draggingItem.startX;
    const dy = e.clientY - draggingItem.startY;
    setFurniture((prev) =>
      prev.map((f) =>
        f.id === draggingItem.id
          ? {
              ...f,
              x: Math.max(0, Math.min(ROOM_W - f.w, draggingItem.origX + dx)),
              y: Math.max(0, Math.min(ROOM_H - f.h, draggingItem.origY + dy)),
            }
          : f
      )
    );
  }, [draggingItem, setFurniture]);

  const handleMouseUp = useCallback(() => setDraggingItem(null), [setDraggingItem]);

  const addFurniture = (cat: typeof FURNITURE_CATALOG[0]) => {
    const newItem: FurnitureItem = {
      id: `f${Date.now()}`,
      ...cat,
      w: cat.realW * scaleX,
      h: cat.realH * scaleY,
      x: Math.max(0, Math.min(ROOM_W - cat.realW * scaleX, 80 + Math.random() * 120)),
      y: Math.max(0, Math.min(ROOM_H - cat.realH * scaleY, 60 + Math.random() * 80)),
      rotation: 0,
    };
    setFurniture((prev) => [...prev, newItem]);
    setSelectedItem(newItem.id);
  };

  const deleteSelected = () => {
    if (selectedItem) {
      setFurniture((prev) => prev.filter((f) => f.id !== selectedItem));
      setSelectedItem(null);
    }
  };

  const rotateSelected = () => {
    if (selectedItem) {
      setFurniture((prev) =>
        prev.map((f) =>
          f.id === selectedItem
            ? { ...f, rotation: (f.rotation + 90) % 360, w: f.h, h: f.w, realW: f.realH, realH: f.realW }
            : f
        )
      );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl gradient-text">Редактор плана</h2>
          <p className="text-muted-foreground text-sm mt-1">Перетаскивайте мебель для уточнения расположения</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItem && (
            <>
              <button onClick={rotateSelected} className="glass px-3 py-2 rounded-lg text-sm hover:bg-white/8 border border-white/10 flex items-center gap-2">
                <Icon name="RotateCw" size={14} /><span className="hidden sm:block">Повернуть</span>
              </button>
              <button onClick={deleteSelected} className="glass px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <Icon name="Trash2" size={14} /><span className="hidden sm:block">Удалить</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Canvas */}
        <div className="glass rounded-2xl p-4 border border-white/8">
          <div
            className="relative rounded-xl overflow-hidden select-none"
            style={{
              width: "100%", maxWidth: `${ROOM_W}px`, height: `${ROOM_H}px`, margin: "0 auto",
              backgroundImage: "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(135deg, #0a1628 0%, #0d1f35 100%)",
              backgroundSize: `${scaleX}px ${scaleX}px, ${scaleX}px ${scaleX}px, 100% 100%`,
              border: "2px solid rgba(0,229,255,0.2)",
              boxShadow: "0 0 40px rgba(0,229,255,0.08), inset 0 0 40px rgba(0,0,0,0.2)",
              cursor: draggingItem ? "grabbing" : "default",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedItem(null)}
          >
            <div className="absolute top-3 left-3 text-xs text-neon-cyan/40 font-display font-semibold pointer-events-none">
              {roomDimensions.width.toFixed(1)} × {roomDimensions.height.toFixed(1)} м
            </div>

            {/* Ruler marks */}
            <div className="absolute bottom-2 right-3 text-[8px] text-neon-cyan/25 pointer-events-none font-display">
              1 клетка = 1 м
            </div>

            {/* Door */}
            <div className="absolute bottom-0 pointer-events-none" style={{ left: "30%" }}>
              <div className="w-12 h-1.5 bg-neon-orange/60" />
              <div className="text-[8px] text-neon-orange/50 mt-0.5 ml-1">Вход</div>
            </div>
            {/* Window */}
            <div className="absolute top-0 right-1/4 w-16 h-1.5 bg-neon-cyan/60 pointer-events-none" />

            {furniture.map((item) => (
              <div
                key={item.id}
                className={`absolute flex items-center justify-center rounded transition-shadow duration-100 ${
                  selectedItem === item.id ? "ring-2 ring-neon-cyan z-10" : "hover:ring-1 hover:ring-white/20"
                }`}
                style={{
                  left: item.x, top: item.y, width: item.w, height: item.h,
                  background: `${item.color}cc`,
                  border: `1px solid ${item.color}`,
                  boxShadow: selectedItem === item.id ? `0 0 15px ${item.color}60` : `0 2px 8px ${item.color}30`,
                  transform: `rotate(${item.rotation}deg)`,
                  cursor: "grab",
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
              >
                <div className="text-center pointer-events-none px-1">
                  <p className="text-white text-[9px] font-semibold leading-tight">{item.label}</p>
                  <p className="text-white/60 text-[8px] leading-tight">{item.realW}×{item.realH}м</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Room dimensions input */}
          <div className={`glass rounded-xl p-4 border transition-colors ${dimEditing ? "border-neon-cyan/30" : "border-white/8"}`}>
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Icon name="Maximize2" size={14} className="text-neon-cyan" />
              Размеры помещения
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Длина (м)</label>
                <input
                  type="number"
                  min="1" max="50" step="0.1"
                  value={dimInput.width}
                  onChange={(e) => { setDimInput((p) => ({ ...p, width: e.target.value })); setDimEditing(true); }}
                  onKeyDown={(e) => e.key === "Enter" && applyDimensions()}
                  className="w-full bg-muted/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-display font-bold text-neon-cyan focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Ширина (м)</label>
                <input
                  type="number"
                  min="1" max="50" step="0.1"
                  value={dimInput.height}
                  onChange={(e) => { setDimInput((p) => ({ ...p, height: e.target.value })); setDimEditing(true); }}
                  onKeyDown={(e) => e.key === "Enter" && applyDimensions()}
                  className="w-full bg-muted/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-display font-bold text-neon-violet focus:outline-none focus:border-neon-violet/50 focus:ring-1 focus:ring-neon-violet/20 transition-all"
                />
              </div>
            </div>
            {dimEditing ? (
              <button
                onClick={applyDimensions}
                className="btn-glow-cyan w-full py-2 rounded-lg text-xs flex items-center justify-center gap-2"
              >
                <Icon name="Check" size={13} />
                Применить размеры
              </button>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Площадь: <span className="text-neon-cyan font-bold">{roomAreaReal.toFixed(1)} м²</span></span>
                <span className="text-white/20">↵ Enter для применения</span>
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="glass rounded-xl p-4 border border-white/8">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Icon name="Ruler" size={14} className="text-neon-cyan" />Площади
            </h3>
            <div className="space-y-3">
              {[
                { label: "Площадь комнаты", val: `${roomAreaReal.toFixed(1)} м²`, color: "text-neon-cyan" },
                { label: "Занято мебелью", val: `${furnitureArea.toFixed(1)} м²`, color: "text-neon-violet" },
                { label: "Свободно", val: `${Math.max(0, roomAreaReal - furnitureArea).toFixed(1)} м²`, color: "text-neon-green" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className={`font-display font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (furnitureArea / roomAreaReal) * 100)}%`, background: "linear-gradient(90deg, #a855f7, #00e5ff)" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                {Math.round((furnitureArea / roomAreaReal) * 100)}% занято
              </p>
            </div>
          </div>

          {/* Selected item info */}
          {selectedItem && (() => {
            const item = furniture.find((f) => f.id === selectedItem);
            if (!item) return null;
            return (
              <div className="glass rounded-xl p-4 border border-neon-cyan/20 animate-scale-in">
                <h3 className="font-display font-bold text-sm mb-3 text-neon-cyan">Выбрано</h3>
                <p className="font-semibold mb-2">{item.label}</p>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  {[
                    ["Длина", `${item.realW.toFixed(2)} м`],
                    ["Ширина", `${item.realH.toFixed(2)} м`],
                    ["Площадь", `${(item.realW * item.realH).toFixed(2)} м²`],
                    ["% от комнаты", `${Math.round((item.realW * item.realH / roomAreaReal) * 100)}%`],
                    ["Поворот", `${item.rotation}°`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span>{l}:</span><span className="text-foreground font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Add furniture */}
          <div className="glass rounded-xl p-4 border border-white/8">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Icon name="Plus" size={14} className="text-neon-violet" />Добавить мебель
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FURNITURE_CATALOG.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => addFurniture(cat)}
                  className="glass p-2 rounded-lg text-xs text-left hover:bg-white/8 transition-all hover:scale-105 border border-white/5 hover:border-white/15"
                >
                  <div className="w-6 h-6 rounded mb-1 flex items-center justify-center" style={{ background: cat.color + "33", border: `1px solid ${cat.color}66` }}>
                    <Icon name={cat.icon} size={12} style={{ color: cat.color }} />
                  </div>
                  <p className="font-medium leading-tight">{cat.label}</p>
                  <p className="text-muted-foreground text-[10px]">{cat.realW}×{cat.realH}м</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
