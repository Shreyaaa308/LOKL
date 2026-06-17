            import { useState } from 'react'

const STATES = [
  { name: 'Jammu & Kashmir', x: 185, y: 55, w: 80, h: 45 },
  { name: 'Himachal Pradesh', x: 210, y: 100, w: 55, h: 35 },
  { name: 'Punjab', x: 175, y: 110, w: 45, h: 35 },
  { name: 'Uttarakhand', x: 255, y: 100, w: 55, h: 35 },
  { name: 'Haryana', x: 195, y: 140, w: 50, h: 35 },
  { name: 'Delhi', x: 228, y: 148, w: 22, h: 20 },
  { name: 'Rajasthan', x: 140, y: 155, w: 110, h: 95 },
  { name: 'Uttar Pradesh', x: 240, y: 140, w: 120, h: 75 },
  { name: 'Bihar', x: 340, y: 155, w: 65, h: 50 },
  { name: 'Sikkim', x: 400, y: 125, w: 25, h: 22 },
  { name: 'Arunachal Pradesh', x: 420, y: 100, w: 80, h: 45 },
  { name: 'Assam', x: 390, y: 143, w: 80, h: 32 },
  { name: 'Nagaland', x: 465, y: 155, w: 35, h: 28 },
  { name: 'Manipur', x: 455, y: 178, w: 35, h: 30 },
  { name: 'Mizoram', x: 440, y: 205, w: 32, h: 28 },
  { name: 'Tripura', x: 415, y: 195, w: 28, h: 28 },
  { name: 'Meghalaya', x: 385, y: 168, w: 50, h: 28 },
  { name: 'West Bengal', x: 355, y: 155, w: 50, h: 90 },
  { name: 'Jharkhand', x: 330, y: 200, w: 60, h: 45 },
  { name: 'Odisha', x: 320, y: 240, w: 70, h: 60 },
  { name: 'Chhattisgarh', x: 265, y: 210, w: 75, h: 70 },
  { name: 'Madhya Pradesh', x: 175, y: 195, w: 115, h: 75 },
  { name: 'Gujarat', x: 105, y: 215, w: 90, h: 80 },
  { name: 'Maharashtra', x: 155, y: 270, w: 120, h: 80 },
  { name: 'Telangana', x: 255, y: 278, w: 75, h: 60 },
  { name: 'Andhra Pradesh', x: 255, y: 318, w: 95, h: 65 },
  { name: 'Karnataka', x: 170, y: 325, w: 95, h: 80 },
  { name: 'Goa', x: 148, y: 360, w: 25, h: 22 },
  { name: 'Kerala', x: 175, y: 390, w: 45, h: 85 },
  { name: 'Tamil Nadu', x: 215, y: 368, w: 80, h: 100 },
  { name: 'Ladakh', x: 210, y: 35, w: 90, h: 55 },
]

const STATE_COLORS = {
  default: '#ddd6fe',
  hover: '#a78bfa',
  selected: '#7c4dcc',
}

export default function IndiaSVGMap({ onStateSelect, selectedState, dark }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox="0 80 560 430" style={{ width: '100%', height: 'auto' }}>
        {/* Background */}
        <rect x="0" y="80" width="560" height="430" fill={dark ? '#1a0a3c' : '#f5f0ff'} rx="12" />

        {STATES.map(({ name, x, y, w, h }) => {
          const isSelected = selectedState === name
          const isHovered = hovered === name
          const fill = isSelected ? STATE_COLORS.selected : isHovered ? STATE_COLORS.hover : STATE_COLORS.default

          return (
            <g key={name}
              onClick={() => onStateSelect(name)}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x} y={y} width={w} height={h}
                rx="4"
                fill={fill}
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: 'fill 0.2s' }}
              />
              <text
                x={x + w / 2} y={y + h / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={w < 35 ? "5" : w < 55 ? "6" : "7"}
                fill={isSelected ? 'white' : '#1a0a3c'}
                fontWeight="600"
                pointerEvents="none"
              >
                {name.length > 12 ? name.split(' ').map((word, i) => (
                  <tspan key={i} x={x + w / 2} dy={i === 0 ? '-3' : '8'}>{word}</tspan>
                )) : name}
              </text>
            </g>
          )
        })}

        {/* India label */}
        <text x="270" y="490" textAnchor="middle" fontSize="10" fill={dark ? '#a78bca' : '#9b6dd6'} fontWeight="600">🇮🇳 INDIA</text>
      </svg>

      {hovered && (
        <div style={{
          position: 'absolute', top: '8px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#7c4dcc', color: 'white',
          padding: '5px 14px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '700',
          pointerEvents: 'none', whiteSpace: 'nowrap'
        }}>
          📍 {hovered}
        </div>
      )}
    </div>
  )
}