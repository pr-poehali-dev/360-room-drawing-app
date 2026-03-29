import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { ANALYSIS_STEPS, AppSection } from "./types";

interface UploadSectionProps {
  isDragging: boolean;
  uploadedFile: string | null;
  setIsDragging: (v: boolean) => void;
  setUploadedFile: (v: string | null) => void;
  onStartAnalysis: () => void;
}

export function UploadSection({
  isDragging,
  uploadedFile,
  setIsDragging,
  setUploadedFile,
  onStartAnalysis,
}: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) setUploadedFile(file.name);
  };

  return (
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
                onClick={(e) => { e.stopPropagation(); onStartAnalysis(); }}
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
  );
}

interface AnalysisSectionProps {
  analysisProgress: number;
  analysisStep: number;
  analysisComplete: boolean;
  onOpenEditor: () => void;
}

export function AnalysisSection({
  analysisProgress,
  analysisStep,
  analysisComplete,
  onOpenEditor,
}: AnalysisSectionProps) {
  return (
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
          <button className="btn-glow-cyan px-8 py-3 rounded-xl text-sm w-full" onClick={onOpenEditor}>
            <Icon name="PenTool" size={16} className="inline mr-2" />
            Открыть в редакторе
          </button>
        </div>
      )}
    </div>
  );
}
