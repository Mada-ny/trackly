import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexA } from "@/utils/ui/colors";
import { GLYPH_ICONS, SWATCHES } from "@/utils/ui/iconMap";

export function GlyphPicker({ options, value, onChange, color = "#3f6f63" }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((key) => {
                const Icon = GLYPH_ICONS[key];
                if (!Icon) return null;
                const active = value === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center border transition-all",
                            !active && "border-border/50 bg-card/50 text-muted-foreground"
                        )}
                        style={active ? { borderColor: hexA(color, 0.55), backgroundColor: hexA(color, 0.13), color } : undefined}
                    >
                        <Icon className="w-5 h-5" strokeWidth={1.9} />
                    </button>
                );
            })}
        </div>
    );
}

export function KindPicker({ options, value, onChange, color = "#3f6f63" }) {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map((kind) => {
                const active = value === kind;
                return (
                    <button
                        key={kind}
                        type="button"
                        onClick={() => onChange(kind)}
                        style={{
                            padding: '9px 15px', borderRadius: 99, cursor: 'pointer',
                            border: '1px solid ' + (active ? hexA(color, 0.5) : 'var(--line)'),
                            background: active ? hexA(color, 0.1) : 'var(--surface)',
                            font: '550 13px var(--sans)', color: active ? 'var(--ink)' : 'var(--ink-soft)', transition: 'all .15s',
                        }}
                    >
                        {kind}
                    </button>
                );
            })}
        </div>
    );
}

export function SwatchPicker({ value, onChange, options = SWATCHES }) {
    return (
        <div className="flex flex-wrap gap-3">
            {options.map((c) => {
                const active = value === c;
                return (
                    <button
                        key={c}
                        type="button"
                        aria-label={c}
                        onClick={() => onChange(c)}
                        className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-shadow"
                        style={{
                            backgroundColor: c,
                            boxShadow: active ? `0 0 0 2.5px var(--background), 0 0 0 4.5px ${c}` : "none",
                        }}
                    >
                        {active && <Check className="w-4 h-4 text-white" strokeWidth={2.6} />}
                    </button>
                );
            })}
        </div>
    );
}
