import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type AppSection = "upload" | "analysis" | "editor" | "gallery" | "export";

interface FurnitureItem {
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

interface SavedPlan {
  id: string;
  name: string;
  date: string;
  area: number;
  rooms: number;
}

const FURNITURE_CATALOG = [
  { type: "sofa", label: "Диван", w: 90, h: 40, color: "#4f46e5", realW: 2.2, realH: 1.0, icon: "Armchair" },
  { type: "bed", label: "Кровать", w: 70, h: 80, color: "#7c3aed", realW: 1.8, realH: 2.0, icon: "BedDouble" },
  { type: "table", label: "Стол", w: 60, h: 40, color: "#0e7490", realW: 1.5, realH: 1.0, icon: "Table" },
  { type: "chair", label: "Стул", w: 35, h: 35, color: "#0369a1", realW: 0.5, realH: 0.5, icon: "Armchair" },
  { type: "wardrobe", label: "Шкаф", w: 80, h: 30, color: "#92400e", realW: 2.0, realH: 0.6, icon: "Square" },
  { type: "tv", label: "ТВ-стенд", w: 70, h: 25, color: "#1e3a5f", realW: 1.8, realH: 0.5, icon: "Monitor" },
  { type: "bathroom", label: "Ванна", w: 55, h: 35, color: "#065f46", realW: 1.7, realH: 0.8, icon: "Bath" },
  { type: "kitchen", label: "Кух. гарнитур", w: 100, h: 30, color: "#7c2d12", realW: 2.5, realH: 0.6, icon: "UtensilsCrossed" },
];

const INITIAL_PLANS: SavedPlan[] = [
  { id: "p1", name: "Гостиная — ЖК Северный", date: "25 марта 2026", area: 34.2, rooms: 1 },
  { id: "p2", name: "Квартира-студия", date: "21 марта 2026", area: 28.7, rooms: 1 },
  { id: "p3", name: "Двухкомнатная на Ленина", date: "18 марта 2026", area: 58.1, rooms: 2 },
];

const ANALYSIS_STEPS = [
  { label: "Декодирование 360° видео", icon: "Video" },
  { label: "Обнаружение стен и углов", icon: "ScanLine" },
  { label: "Построение геометрии комнаты", icon: "LayoutGrid" },
  { label: "Распознавание мебели", icon: "Boxes" },
  { label: "Расчёт масштаба и размеров", icon: "Ruler" },
  { label: "Генерация 2D плана", icon: "Map" },
];

export default function Index() {
  const [section, setSection] = useState<AppSection>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([
    { id: "f1", type: "sofa", label: "Диван", x: 60, y: 80, w: 90, h: 40, color: "#4f46e5", rotation: 0, realW: 2.2, realH: 1.0 },
    { id: "f2", type: "bed", label: "Кровать", x: 230, y: 55, w: 70, h: 80, color: "#7c3aed", rotation: 0, realW: 1.8, realH: 2.0 },
    { id: "f3", type: "tv", label: "ТВ-стенд", x: 60, y: 190, w: 70, h: 25, color: "#1e3a5f", rotation: 0, realW: 1.8, realH: 0.5 },
    { id: "f4", type: "table", label: "Стол", x: 190, y: 185, w: 60, h: 40, color: "#0e7490", rotation: 0, realW: 1.5, realH: 1.0 },
  ]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{
    id: string; startX: number; startY: number; origX: number; origY: number;
  } | null>(null);
  const [savedPlans] = useState<SavedPlan[]>(INITIAL_PLANS);
  const roomW = 380;
  const roomH = 280;
  const scale = 0.065;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roomAreaReal = (roomW * scale) * (roomH * scale);
  const furnitureArea = furniture.reduce((sum, f) => sum + f.realW * f.realH, 0);

  const runAnalysis = useCallback(() => {
    setSection("analysis");
    setAnalysisProgress(0);
    setAnalysisStep(0);
    setAnalysisComplete(false);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(Math.min(step, ANALYSIS_STEPS.length - 1));
      setAnalysisProgress(Math.min((step / ANALYSIS_STEPS.length) * 100, 100));
      if (step >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setAnalysisComplete(true), 500);
      }
    }, 650);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) setUploadedFile(file.name);
  }, []);

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
              x: Math.max(0, Math.min(roomW - f.w, draggingItem.origX + dx)),
              y: Math.max(0, Math.min(roomH - f.h, draggingItem.origY + dy)),
            }
          : f
      )
    );
  }, [draggingItem, roomW, roomH]);

  const handleMouseUp = useCallback(() => setDraggingItem(null), []);

  const addFurniture = (cat: typeof FURNITURE_CATALOG[0]) => {
    const newItem: FurnitureItem = {
      id: `f${Date.now()}`,
      ...cat,
      x: 80 + Math.random() * 120,
      y: 60 + Math.random() * 80,
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
            ? { ...f, rotation: (f.rotation + 90) % 360, w: f.h, h: f.w }
            : f
        )
      );
    }
  };

  const navItems: { id: AppSection; label: string; icon: string }[] = [
    { id: "upload", label: "Загрузка", icon: "Upload" },
    { id: "analysis", label: "Анализ", icon: "ScanEye" },
    { id: "editor", label: "Редактор", icon: "PenTool" },
    { id: "gallery", label: "Галерея", icon: "Images" },
    { id: "export", label: "Экспорт", icon: "Download" },
  ];

  return (
    <div className="min-h-screen mesh-bg grid-pattern font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl btn-glow-cyan flex items-center justify-center">
              <Icon name="ScanLine" size={18} />
            </div>
            <span className="font-display font-extrabold text-xl gradient-text tracking-tight">PlanAI</span>
            <span className="hidden sm:block text-xs text-muted-foreground mt-0.5">360° → 2D</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  section === item.id
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} size={15} />
                <span className="hidden md:block">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:block">AI готов</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* ── UPLOAD ── */}
        {section === "upload" && (
          <div className="animate-fade-in">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-neon-cyan/20 text-neon-cyan text-xs font-medium mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                Загрузите видео 360°
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                Превратите видео<br />
                <span className="gradient-text">в план помещения</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                ИИ автоматически распознает стены, мебель и рассчитает площадь комнаты
              </p>
            </div>

            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragging
                  ? "border-neon-cyan bg-neon-cyan/5"
                  : uploadedFile
                  ? "border-neon-green bg-neon-green/5"
                  : "border-white/15 hover:border-neon-cyan/40"
              }`}
              style={{ minHeight: "300px" }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setUploadedFile(f.name);
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="w-64 h-64 rounded-full border-4 border-neon-cyan animate-spin-slow" />
                <div className="absolute w-40 h-40 rounded-full border-2 border-neon-violet" style={{ animation: "spin 5s linear infinite reverse" }} />
              </div>

              <div className="relative flex flex-col items-center justify-center py-20 px-8 text-center">
                {uploadedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-4">
                      <Icon name="CheckCircle" size={32} className="text-neon-green" />
                    </div>
                    <p className="font-display font-bold text-xl text-neon-green mb-1">Файл загружен!</p>
                    <p className="text-muted-foreground text-sm mb-6">{uploadedFile}</p>
                    <button
                      className="btn-glow-cyan px-8 py-3 rounded-xl text-sm"
                      onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
                    >
                      <Icon name="Play" size={16} className="inline mr-2" />
                      Начать анализ
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${isDragging ? "bg-neon-cyan/15 border border-neon-cyan/40 animate-float" : "bg-white/5 border border-white/10"}`}>
                      <Icon name="Video" size={36} className={isDragging ? "text-neon-cyan" : "text-muted-foreground"} />
                    </div>
                    <p className="font-display font-bold text-xl mb-2">
                      {isDragging ? "Отпустите файл" : "Перетащите 360° видео"}
                    </p>
                    <p className="text-muted-foreground text-sm mb-6">или нажмите для выбора файла</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["MP4", "MOV", "AVI", "360°"].map((fmt) => (
                        <span key={fmt} className="px-3 py-1 rounded-full glass text-xs text-muted-foreground">{fmt}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: "ScanEye", title: "AI-распознавание", desc: "Нейросеть определяет контуры стен, дверей и окон из 360° обзора", color: "cyan" },
                { icon: "Boxes", title: "Детекция мебели", desc: "Автоматическое распознавание предметов с классификацией", color: "violet" },
                { icon: "Ruler", title: "Расчёт площади", desc: "Точные размеры в метрах — комнаты и каждого предмета", color: "orange" },
              ].map((feat) => (
                <div key={feat.title} className={`glass rounded-xl p-5 border border-white/8 hover:border-neon-${feat.color}/20 transition-colors`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feat.color === "cyan" ? "bg-neon-cyan/10" : feat.color === "violet" ? "bg-neon-violet/10" : "bg-neon-orange/10"}`}>
                    <Icon name={feat.icon} size={20} className={feat.color === "cyan" ? "text-neon-cyan" : feat.color === "violet" ? "text-neon-violet" : "text-neon-orange"} />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{feat.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYSIS ── */}
        {section === "analysis" && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display font-extrabold text-3xl mb-2">
                {analysisComplete
                  ? <span className="text-neon-green">Анализ завершён!</span>
                  : <span className="gradient-text">Анализируем видео...</span>}
              </h2>
              <p className="text-muted-foreground">
                {analysisComplete ? "2D план готов к редактированию" : "ИИ обрабатывает 360° видео"}
              </p>
            </div>

            <div className="glass rounded-2xl p-6 mb-6 border border-white/8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Прогресс обработки</span>
                <span className="font-display font-bold text-neon-cyan">{Math.round(analysisProgress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${analysisProgress}%`,
                    background: "linear-gradient(90deg, #00e5ff, #a855f7)",
                    boxShadow: "0 0 10px rgba(0,229,255,0.4)"
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {ANALYSIS_STEPS.map((step, i) => {
                const isDone = analysisComplete || i < analysisStep;
                const isActive = !analysisComplete && i === analysisStep;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive ? "glass-bright border border-neon-cyan/30"
                      : isDone ? "glass border border-neon-green/20"
                      : "glass border border-white/5 opacity-40"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-neon-green/15" : isActive ? "bg-neon-cyan/15" : "bg-muted"}`}>
                      {isDone
                        ? <Icon name="Check" size={16} className="text-neon-green" />
                        : isActive
                        ? <Icon name={step.icon} size={16} className="text-neon-cyan animate-pulse" />
                        : <Icon name={step.icon} size={16} className="text-muted-foreground" />}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? "text-neon-green" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    {isDone && <Icon name="CheckCircle" size={14} className="ml-auto text-neon-green/50" />}
                  </div>
                );
              })}
            </div>

            {analysisComplete && (
              <div className="animate-scale-in text-center">
                <div className="glass rounded-2xl p-6 border border-neon-green/20 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { val: "34.2", unit: "м² площадь", color: "text-neon-cyan" },
                      { val: "7", unit: "предметов мебели", color: "text-neon-violet" },
                      { val: "98%", unit: "точность", color: "text-neon-orange" },
                    ].map((s) => (
                      <div key={s.unit}>
                        <p className={`text-2xl font-display font-extrabold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-glow-cyan px-8 py-3 rounded-xl text-sm w-full" onClick={() => setSection("editor")}>
                  <Icon name="PenTool" size={16} className="inline mr-2" />
                  Открыть в редакторе
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── EDITOR ── */}
        {section === "editor" && (
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
                    width: "100%", maxWidth: `${roomW}px`, height: `${roomH}px`, margin: "0 auto",
                    backgroundImage: "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(135deg, #0a1628 0%, #0d1f35 100%)",
                    backgroundSize: "20px 20px, 20px 20px, 100% 100%",
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
                    {(roomW * scale).toFixed(1)} × {(roomH * scale).toFixed(1)} м
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

                {/* Selected info */}
                {selectedItem && (() => {
                  const item = furniture.find((f) => f.id === selectedItem);
                  if (!item) return null;
                  return (
                    <div className="glass rounded-xl p-4 border border-neon-cyan/20 animate-scale-in">
                      <h3 className="font-display font-bold text-sm mb-3 text-neon-cyan">Выбрано</h3>
                      <p className="font-semibold mb-2">{item.label}</p>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        {[
                          ["Ширина", `${item.realW} м`],
                          ["Глубина", `${item.realH} м`],
                          ["Площадь", `${(item.realW * item.realH).toFixed(2)} м²`],
                          ["Поворот", `${item.rotation}°`],
                        ].map(([l, v]) => (
                          <div key={l} className="flex justify-between">
                            <span>{l}:</span><span className="text-foreground">{v}</span>
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
        )}

        {/* ── GALLERY ── */}
        {section === "gallery" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl gradient-text">Галерея планов</h2>
                <p className="text-muted-foreground text-sm mt-1">Ваши сохранённые 2D планы</p>
              </div>
              <button className="btn-glow-cyan px-4 py-2 rounded-xl text-sm flex items-center gap-2" onClick={() => setSection("upload")}>
                <Icon name="Plus" size={15} />Новый план
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {savedPlans.map((plan, i) => (
                <div
                  key={plan.id}
                  className="glass rounded-2xl overflow-hidden border border-white/8 hover:border-neon-cyan/20 transition-all duration-300 hover:-translate-y-1 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="relative h-44 overflow-hidden"
                    style={{
                      backgroundImage: "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(135deg, #0a1628, #0d1f35)",
                      backgroundSize: "15px 15px, 15px 15px, 100% 100%",
                    }}
                  >
                    <div className="absolute inset-4 border border-neon-cyan/20 rounded-lg" />
                    {[
                      { l: 30, t: 30, w: 60, h: 25, c: "#4f46e5" },
                      { l: 110, t: 25, w: 45, h: 50, c: "#7c3aed" },
                      { l: 170, t: 30, w: 40, h: 25, c: "#0e7490" },
                      { l: 30, t: 80, w: 45, h: 20, c: "#1e3a5f" },
                      { l: 130, t: 90, w: 55, h: 30, c: "#92400e" },
                    ].map((r, ri) => (
                      <div key={ri} className="absolute rounded-sm" style={{ left: r.l, top: r.t, width: r.w, height: r.h, background: r.c + "aa", border: `1px solid ${r.c}` }} />
                    ))}
                    <div className="absolute top-2 right-2 glass px-2 py-0.5 rounded text-[10px] text-neon-cyan border border-neon-cyan/20">{plan.area} м²</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <button className="btn-glow-cyan px-4 py-1.5 rounded-lg text-xs" onClick={() => setSection("editor")}>
                        <Icon name="PenTool" size={12} className="inline mr-1" />Редактировать
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-sm mb-1 group-hover:text-neon-cyan transition-colors">{plan.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{plan.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="LayoutGrid" size={11} />{plan.rooms} комн.
                        </span>
                        <button onClick={() => setSection("export")} className="text-xs text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1">
                          <Icon name="Download" size={11} />Экспорт
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-neon-cyan/20 transition-colors cursor-pointer flex flex-col items-center justify-center p-10 gap-3 min-h-[260px]"
                onClick={() => setSection("upload")}
              >
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10">
                  <Icon name="Plus" size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">Загрузите 360° видео для создания нового плана</p>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {section === "export" && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display font-extrabold text-3xl gradient-text mb-2">Экспорт плана</h2>
              <p className="text-muted-foreground">Скачайте план в нужном формате</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { fmt: "PDF", icon: "FileText", desc: "Высококачественный план для печати A4/A3", color: "cyan", extra: "с расчётом площадей" },
                { fmt: "PNG", icon: "Image", desc: "Изображение для презентаций и мессенджеров", color: "violet", extra: "4K разрешение" },
                { fmt: "SVG", icon: "Layers", desc: "Векторный формат для редакторов", color: "orange", extra: "масштабируемый" },
                { fmt: "DXF", icon: "Cpu", desc: "Для AutoCAD и профессиональных CAD-систем", color: "green", extra: "готов к CAD" },
              ].map((item) => (
                <div key={item.fmt} className={`glass rounded-xl p-5 border border-white/8 cursor-pointer transition-all hover:-translate-y-0.5 group ${item.color === "cyan" ? "hover:border-neon-cyan/30" : item.color === "violet" ? "hover:border-neon-violet/30" : item.color === "orange" ? "hover:border-neon-orange/30" : "hover:border-neon-green/30"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color === "cyan" ? "bg-neon-cyan/10" : item.color === "violet" ? "bg-neon-violet/10" : item.color === "orange" ? "bg-neon-orange/10" : "bg-neon-green/10"}`}>
                      <Icon name={item.icon} size={22} className={item.color === "cyan" ? "text-neon-cyan" : item.color === "violet" ? "text-neon-violet" : item.color === "orange" ? "text-neon-orange" : "text-neon-green"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold">{item.fmt}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.color === "cyan" ? "bg-neon-cyan/10 text-neon-cyan" : item.color === "violet" ? "bg-neon-violet/10 text-neon-violet" : item.color === "orange" ? "bg-neon-orange/10 text-neon-orange" : "bg-neon-green/10 text-neon-green"}`}>{item.extra}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Icon name="Download" size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity mt-1 ${item.color === "cyan" ? "text-neon-cyan" : item.color === "violet" ? "text-neon-violet" : item.color === "orange" ? "text-neon-orange" : "text-neon-green"}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8 mb-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Icon name="FileBarChart" size={15} className="text-neon-cyan" />Отчёт о помещении
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Общая площадь", value: `${roomAreaReal.toFixed(1)} м²`, color: "text-neon-cyan" },
                  { label: "Предметов мебели", value: `${furniture.length} шт.`, color: "text-neon-violet" },
                  { label: "Занято мебелью", value: `${furnitureArea.toFixed(1)} м²`, color: "text-neon-orange" },
                  { label: "Свободная площадь", value: `${Math.max(0, roomAreaReal - furnitureArea).toFixed(1)} м²`, color: "text-neon-green" },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`font-display font-extrabold text-lg ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-glow-cyan w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
              <Icon name="Package" size={18} />
              Скачать полный отчёт (PDF + PNG)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
