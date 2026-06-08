function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

export function GlyphChip({ icon: Icon, color = '#8a8170', size = 44, radius = 14, soft = 0.13 }) {
    const [r, g, b] = hexToRgb(color);
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `rgba(${r},${g},${b},${soft})`,
                color,
            }}
        >
            <Icon size={Math.round(size * 0.46)} strokeWidth={1.8} />
        </div>
    );
}
