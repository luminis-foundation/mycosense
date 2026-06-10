/**
 * FieldMap.jsx
 * SVG-based physical layout overlay showing electrode placement
 * in the Pecos Canyon research plot.
 *
 * Each electrode node is rendered at its physical (x, y) position
 * with a live health-colored pulse ring and value readout.
 * Clicking a node shows its metadata tooltip.
 */

import { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import {
  ELECTRODE_PLACEMENTS,
  ZONE_COLORS,
  ZONE_REGIONS,
  FIELD_BOUNDS,
} from '../data/fieldLayout'

function healthColor(score) {
  if (score === undefined || score === null) return '#4a7c59'
  if (score >= 70) return '#7fff7a'
  if (score >= 40) return '#e8a838'
  return '#e05c3a'
}

function NodeTooltip({ node, reading, proc, onClose }) {
  const health = proc?.health
  const hc     = healthColor(health)

  return (
    <div className="absolute z-20 bg-myco-bark border border-myco-moss rounded-xl p-4 shadow-xl w-64"
      style={{ top: `${Math.min(node.y + 5, 70)}%`, left: `${Math.min(node.x + 3, 65)}%` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="label-tag">{node.id}</p>
          <p className="font-display text-sm font-semibold text-myco-mist">{node.label}</p>
          <p className="text-xs text-myco-spore">{node.zone}</p>
        </div>
        <button onClick={onClose} className="text-myco-spore hover:text-myco-mist">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
        <div>
          <p className="text-myco-spore">value</p>
          <p className="text-myco-mist">{reading?.value?.toFixed(1) ?? '—'} mV</p>
        </div>
        <div>
          <p className="text-myco-spore">health</p>
          <p style={{ color: hc }}>{health !== undefined ? Math.round(health) + '%' : '—'}</p>
        </div>
        <div>
          <p className="text-myco-spore">depth</p>
          <p className="text-myco-mist">{node.depth}</p>
        </div>
        <div>
          <p className="text-myco-spore">spike</p>
          <p className={proc?.spike ? 'text-myco-alert' : 'text-myco-spore'}>
            {proc?.spike ? 'yes ⚡' : 'none'}
          </p>
        </div>
      </div>

      <p className="text-xs text-myco-spore border-t border-myco-moss pt-2">{node.substrate}</p>
      {node.notes && <p className="text-xs text-myco-spore mt-1 italic">{node.notes}</p>}
    </div>
  )
}

export function FieldMap({ readings, processed }) {
  const [activeNode, setActiveNode] = useState(null)

  const W = 800
  const H = 520

  const toSVG = (pct, max) => (pct / 100) * max

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={14} className="text-myco-spore" />
        <span className="label-tag">Field Layout</span>
        <span className="text-xs font-mono text-myco-spore ml-auto">{FIELD_BOUNDS.label}</span>
      </div>

      {/* Map container */}
      <div className="relative rounded-lg overflow-hidden border border-myco-moss" style={{ background: '#131a0f' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ display: 'block' }}
        >
          {/* Zone background regions */}
          {ZONE_REGIONS.map(region => (
            <rect
              key={region.zone}
              x={toSVG(region.x, W)}
              y={toSVG(region.y, H)}
              width={toSVG(region.w, W)}
              height={toSVG(region.h, H)}
              fill={ZONE_COLORS[region.zone]}
              fillOpacity={0.06}
              rx={8}
            />
          ))}

          {/* Zone labels */}
          {ZONE_REGIONS.map(region => (
            <text
              key={`label-${region.zone}`}
              x={toSVG(region.x + 1, W)}
              y={toSVG(region.y + 3.5, H)}
              fontSize={10}
              fill={ZONE_COLORS[region.zone]}
              fillOpacity={0.6}
              fontFamily="JetBrains Mono, monospace"
              letterSpacing={1}
            >
              {region.zone.toUpperCase()}
            </text>
          ))}

          {/* Connection lines between same-zone nodes */}
          {[
            ['E01', 'E02'],
            ['E03', 'E04'],
            ['E05', 'E06'],
          ].map(([a, b]) => {
            const na = ELECTRODE_PLACEMENTS.find(n => n.id === a)
            const nb = ELECTRODE_PLACEMENTS.find(n => n.id === b)
            if (!na || !nb) return null
            return (
              <line
                key={`${a}-${b}`}
                x1={toSVG(na.x, W)} y1={toSVG(na.y, H)}
                x2={toSVG(nb.x, W)} y2={toSVG(nb.y, H)}
                stroke={ZONE_COLORS[na.zone]}
                strokeOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Electrode nodes */}
          {ELECTRODE_PLACEMENTS.map(node => {
            const cx     = toSVG(node.x, W)
            const cy     = toSVG(node.y, H)
            const proc   = processed[node.id]
            const health = proc?.health
            const color  = healthColor(health)
            const isActive = activeNode?.id === node.id

            return (
              <g
                key={node.id}
                onClick={() => setActiveNode(isActive ? null : node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulse ring */}
                <circle cx={cx} cy={cy} r={18} fill={color} fillOpacity={0.1} />
                {/* Mid ring */}
                <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1} strokeOpacity={0.4} />
                {/* Core dot */}
                <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.9} />
                {/* Active ring */}
                {isActive && <circle cx={cx} cy={cy} r={20} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.8} />}

                {/* Label */}
                <text
                  x={cx} y={cy + 30}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#a8c5a0"
                  fontFamily="JetBrains Mono, monospace"
                  opacity={0.8}
                >
                  {node.id}
                </text>

                {/* Live value */}
                {readings[node.id] && (
                  <text
                    x={cx} y={cy - 22}
                    textAnchor="middle"
                    fontSize={9}
                    fill={color}
                    fontFamily="JetBrains Mono, monospace"
                    opacity={0.9}
                  >
                    {readings[node.id].value?.toFixed(0)}mV
                  </text>
                )}
              </g>
            )
          })}

          {/* Scale bar */}
          <g>
            <line x1={W - 90} y1={H - 20} x2={W - 30} y2={H - 20} stroke="#4a7c59" strokeWidth={1} />
            <line x1={W - 90} y1={H - 24} x2={W - 90} y2={H - 16} stroke="#4a7c59" strokeWidth={1} />
            <line x1={W - 30} y1={H - 24} x2={W - 30} y2={H - 16} stroke="#4a7c59" strokeWidth={1} />
            <text x={W - 60} y={H - 26} textAnchor="middle" fontSize={8} fill="#4a7c59" fontFamily="JetBrains Mono, monospace">
              {FIELD_BOUNDS.widthM / 2}m
            </text>
          </g>

          {/* North indicator */}
          <text x={18} y={22} fontSize={10} fill="#4a7c59" fontFamily="JetBrains Mono, monospace" opacity={0.6}>N↑</text>
        </svg>

        {/* Tooltip overlay */}
        {activeNode && (
          <NodeTooltip
            node={activeNode}
            reading={readings[activeNode.id]}
            proc={processed[activeNode.id]}
            onClose={() => setActiveNode(null)}
          />
        )}
      </div>

      {/* Zone legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {Object.entries(ZONE_COLORS).map(([zone, color]) => (
          <div key={zone} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, opacity: 0.8 }} />
            <span className="text-xs font-mono text-myco-spore">{zone}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
