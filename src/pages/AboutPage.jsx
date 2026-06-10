/**
 * AboutPage.jsx
 * Mission statement, research context, and technical overview.
 * Grant-printable — designed to be screenshotted or linked in funding applications.
 */

import { ExternalLink, Dna, Zap, Leaf, Globe } from 'lucide-react'

const PILLARS = [
  {
    icon: Dna,
    title: 'Fungal Electrophysiology',
    body: 'Mycelium networks generate measurable electrochemical signals in response to environmental stimuli — nutrient gradients, moisture, temperature, and biological stress. MycoSense captures these signals in real time through a multi-electrode array embedded across rhizosphere, substrate, and canopy zones.',
  },
  {
    icon: Zap,
    title: 'Biosensor Infrastructure',
    body: 'Each electrode node samples at 500ms intervals, streaming millivolt-range readings through a signal processing pipeline that performs rolling smoothing, spike detection, variance analysis, and per-electrode health scoring. Data is exportable as CSV or SQLite for downstream research.',
  },
  {
    icon: Leaf,
    title: 'Regenerative Agriculture',
    body: 'Healthy mycelium networks are indicators of soil ecosystem vitality. By making fungal electrophysiology legible to farmers and researchers, MycoSense bridges precision monitoring with regenerative land stewardship — providing data-driven insight into what living soil is actually doing.',
  },
  {
    icon: Globe,
    title: 'Open Science',
    body: 'MycoSense is developed by the Luminis Foundation as open-source research infrastructure. Hardware schematics, firmware, and this dashboard are publicly available. The underlying research is anchored by a published preprint on fungal electrophysiology and biosensor systems.',
  },
]

const TECH_STACK = [
  { label: 'Frontend',          value: 'React 18 + Vite + Tailwind CSS' },
  { label: 'Visualization',     value: 'Recharts — time-series waveforms' },
  { label: 'Signal Processing', value: 'Rolling EMA, spike detection, variance analysis' },
  { label: 'Data Export',       value: 'CSV + SQLite (sql.js WASM, in-browser)' },
  { label: 'Hardware Bridge',   value: 'Web Serial API (USB) + WebSocket (network)' },
  { label: 'Deployment',        value: 'Static export — offline-first compatible' },
  { label: 'Electrode Array',   value: '6-node multi-zone (Rhizosphere · Substrate · Canopy)' },
  { label: 'Sampling Rate',     value: '500ms per node (configurable)' },
]

export function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl">

      {/* Hero statement */}
      <div className="border-l-2 border-myco-spore pl-5">
        <p className="font-display text-lg text-myco-mycel font-medium leading-relaxed">
          MycoSense is a real-time ecosystem health monitor that reads the electrical language of living mycelium networks — translating fungal electrophysiology into legible, actionable data for regenerative agriculture research.
        </p>
      </div>

      {/* Research pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-myco-spore" />
              <p className="font-display text-sm font-semibold text-myco-mist">{title}</p>
            </div>
            <p className="text-xs text-myco-spore leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Technical overview */}
      <div className="card">
        <p className="label-tag mb-3">Technical Overview</p>
        <div className="divide-y divide-myco-moss">
          {TECH_STACK.map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 gap-4">
              <span className="text-xs font-mono text-myco-spore shrink-0">{label}</span>
              <span className="text-xs font-mono text-myco-mist text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Research anchor */}
      <div className="card">
        <p className="label-tag mb-2">Research Anchor</p>
        <p className="text-xs text-myco-spore mb-3">
          This dashboard is the applied instrumentation layer for ongoing Luminis Foundation research into fungal electrophysiology and decentralized biosensor networks.
        </p>
        <a
          href="https://doi.org/10.5281/zenodo.20143391"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-myco-mycel hover:text-myco-pulse transition-colors"
        >
          <ExternalLink size={11} />
          DOI 10.5281/zenodo.20143391 — Preprint
        </a>
      </div>

      {/* Foundation */}
      <div className="card">
        <p className="label-tag mb-2">Luminis Foundation</p>
        <p className="text-xs text-myco-spore leading-relaxed">
          501(c)(3) nonprofit research organization · Rowe, New Mexico · Pecos River Valley<br />
          EIN 41-4984345 · NM Entity #0008089293<br />
          Focused on mycelium-inspired computing, regenerative biosystems, and open-source ecological monitoring infrastructure.
        </p>
        <a
          href="https://github.com/luminis-foundation/mycosense"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-myco-mycel hover:text-myco-pulse transition-colors mt-3"
        >
          <ExternalLink size={11} />
          github.com/luminis-foundation/mycosense
        </a>
      </div>
    </div>
  )
}
