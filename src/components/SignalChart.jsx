/**
 * SignalChart.jsx
 * Time-series waveform display for a single electrode's history.
 */

import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine, Tooltip } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-myco-soil border border-myco-moss px-2 py-1 rounded text-xs font-mono text-myco-pulse">
      {payload[0].value.toFixed(1)} mV
    </div>
  )
}

export function SignalChart({ historyBuffer, spike }) {
  if (!historyBuffer || historyBuffer.length < 2) {
    return (
      <div className="h-20 flex items-center justify-center text-myco-spore text-xs font-mono">
        awaiting signal...
      </div>
    )
  }

  const data = historyBuffer.map((h, i) => ({ i, value: h.value }))

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['auto', 'auto']} hide />
          <ReferenceLine y={0} stroke="#4a7c59" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={spike ? '#e05c3a' : '#7fff7a'}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
