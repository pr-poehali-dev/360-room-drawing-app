import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { AppSection, FurnitureItem, SavedPlan, INITIAL_PLANS, ANALYSIS_STEPS } from "@/components/plan/types";
import { UploadSection, AnalysisSection } from "@/components/plan/UploadAnalysisSection";
import { EditorSection } from "@/components/plan/EditorSection";
import { GallerySection, ExportSection } from "@/components/plan/GalleryExportSection";

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
        {section === "upload" && (
          <UploadSection
            isDragging={isDragging}
            uploadedFile={uploadedFile}
            setIsDragging={setIsDragging}
            setUploadedFile={setUploadedFile}
            onStartAnalysis={runAnalysis}
          />
        )}

        {section === "analysis" && (
          <AnalysisSection
            analysisProgress={analysisProgress}
            analysisStep={analysisStep}
            analysisComplete={analysisComplete}
            onOpenEditor={() => setSection("editor")}
          />
        )}

        {section === "editor" && (
          <EditorSection
            furniture={furniture}
            setFurniture={setFurniture}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            draggingItem={draggingItem}
            setDraggingItem={setDraggingItem}
          />
        )}

        {section === "gallery" && (
          <GallerySection
            savedPlans={savedPlans}
            onNewPlan={() => setSection("upload")}
            onEditPlan={() => setSection("editor")}
            onExportPlan={() => setSection("export")}
          />
        )}

        {section === "export" && (
          <ExportSection furniture={furniture} />
        )}
      </main>
    </div>
  );
}
