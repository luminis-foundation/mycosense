/**
 * SensorGrid.jsx
 * Responsive grid of SensorCard components — one per electrode.
 */

import { SensorCard } from './SensorCard'
import { getSensorConfig } from '../data/mockSensorData'

export function SensorGrid({ readings, processed, history }) {
  const config = getSensorConfig()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {config.map(sensor => {
        const reading = readings[sensor.id]
        const proc    = processed[sensor.id]
        const hist    = history[sensor.id] || []

        if (!reading || !proc) {
          return (
            <div key={sensor.id} className="card opacity-40">
              <p className="label-tag">{sensor.id}</p>
              <p className="text-sm font-display text-myco-spore mt-1">{sensor.label}</p>
              <p className="text-xs font-mono text-myco-spore mt-4">awaiting data...</p>
            </div>
          )
        }

        return (
          <SensorCard
            key={sensor.id}
            reading={reading}
            processed={proc}
            history={hist}
          />
        )
      })}
    </div>
  )
}
