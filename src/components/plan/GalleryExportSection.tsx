import Icon from "@/components/ui/icon";
import { FurnitureItem, SavedPlan, ROOM_W, ROOM_H, ROOM_SCALE } from "./types";

interface GallerySectionProps {
  savedPlans: SavedPlan[];
  onNewPlan: () => void;
  onEditPlan: () => void;
  onExportPlan: () => void;
}

export function GallerySection({ savedPlans, onNewPlan, onEditPlan, onExportPlan }: GallerySectionProps) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-extrabold text-2xl gradient-text">Галерея планов</h2>
          <p className="text-muted-foreground text-sm mt-1">Ваши сохранённые 2D планы</p>
        </div>
        <button className="btn-glow-cyan px-4 py-2 rounded-xl text-sm flex items-center gap-2" onClick={onNewPlan}>
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
                <button className="btn-glow-cyan px-4 py-1.5 rounded-lg text-xs" onClick={onEditPlan}>
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
                  <button onClick={onExportPlan} className="text-xs text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1">
                    <Icon name="Download" size={11} />Экспорт
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div
          className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-neon-cyan/20 transition-colors cursor-pointer flex flex-col items-center justify-center p-10 gap-3 min-h-[260px]"
          onClick={onNewPlan}
        >
          <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10">
            <Icon name="Plus" size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">Загрузите 360° видео для создания нового плана</p>
        </div>
      </div>
    </div>
  );
}

interface ExportSectionProps {
  furniture: FurnitureItem[];
}

export function ExportSection({ furniture }: ExportSectionProps) {
  const roomAreaReal = (ROOM_W * ROOM_SCALE) * (ROOM_H * ROOM_SCALE);
  const furnitureArea = furniture.reduce((sum, f) => sum + f.realW * f.realH, 0);

  return (
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
          <div
            key={item.fmt}
            className={`glass rounded-xl p-5 border border-white/8 cursor-pointer transition-all hover:-translate-y-0.5 group ${
              item.color === "cyan" ? "hover:border-neon-cyan/30"
              : item.color === "violet" ? "hover:border-neon-violet/30"
              : item.color === "orange" ? "hover:border-neon-orange/30"
              : "hover:border-neon-green/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.color === "cyan" ? "bg-neon-cyan/10"
                : item.color === "violet" ? "bg-neon-violet/10"
                : item.color === "orange" ? "bg-neon-orange/10"
                : "bg-neon-green/10"
              }`}>
                <Icon name={item.icon} size={22} className={
                  item.color === "cyan" ? "text-neon-cyan"
                  : item.color === "violet" ? "text-neon-violet"
                  : item.color === "orange" ? "text-neon-orange"
                  : "text-neon-green"
                } />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold">{item.fmt}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    item.color === "cyan" ? "bg-neon-cyan/10 text-neon-cyan"
                    : item.color === "violet" ? "bg-neon-violet/10 text-neon-violet"
                    : item.color === "orange" ? "bg-neon-orange/10 text-neon-orange"
                    : "bg-neon-green/10 text-neon-green"
                  }`}>{item.extra}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Icon name="Download" size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity mt-1 ${
                item.color === "cyan" ? "text-neon-cyan"
                : item.color === "violet" ? "text-neon-violet"
                : item.color === "orange" ? "text-neon-orange"
                : "text-neon-green"
              }`} />
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
  );
}
