'use client';

import { ComposableMap, Geographies, Geography, Annotation } from 'react-simple-maps';

// Argentina provinces TopoJSON — served locally from /public
const GEO_URL = '/argentina-provinces.json';

// ── Distributor labels ─────────────────────────────────────────────────────
// Coordinates: [longitude, latitude] approximately centered over the
// distributor's service area.

interface Distributor {
  name: string;
  value: number;
  dx: number; // annotation line offset x
  dy: number; // annotation line offset y
  coordinates: [number, number];
}

const DISTRIBUTORS: Distributor[] = [
  { name: 'EDESAL', value: -8.11,  coordinates: [-64.5,  -24.6], dx:  30, dy: -10 },
  { name: 'EDECAT', value: -20.08, coordinates: [-66.5,  -28.4], dx: -35, dy: -10 },
  { name: 'EDET',   value: -12.04, coordinates: [-65.2,  -26.9], dx:  35, dy:  -8 },
  { name: 'DPEC',   value: -11.29, coordinates: [-58.8,  -27.5], dx:  35, dy:  -8 },
  { name: 'EPEC',   value: -3.51,  coordinates: [-64.2,  -31.4], dx:  35, dy: -10 },
  { name: 'EDEMSA', value: -12.37, coordinates: [-68.8,  -32.9], dx: -35, dy:  -8 },
  { name: 'EDENOR', value: -7.11,  coordinates: [-58.5,  -34.2], dx:  32, dy: -12 },
  { name: 'EDESUR', value: -6.77,  coordinates: [-58.5,  -35.0], dx:  32, dy:  10 },
  { name: 'EDELAP', value: -8.77,  coordinates: [-57.9,  -35.0], dx:  32, dy:  22 },
  { name: 'EDEN',   value: -16.52, coordinates: [-60.2,  -36.6], dx: -32, dy:  12 },
  { name: 'EDEA',   value: -18.67, coordinates: [-57.5,  -37.8], dx:  32, dy:   8 },
  { name: 'EDES',   value: -14.02, coordinates: [-62.5,  -38.8], dx: -32, dy:  12 },
];

// ── Color scale for values ─────────────────────────────────────────────────

function labelColor(value: number) {
  if (value <= -15) return '#dc2626'; // red
  if (value <= -8)  return '#ea580c'; // orange
  return '#16a34a'; // green
}

// ── Component ──────────────────────────────────────────────────────────────

interface ArgentinaMapProps {
  title?: string;
  subtitle?: string;
}

export function ArgentinaMap({ title, subtitle }: ArgentinaMapProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [-65, -38],
            scale: 620,
          }}
          width={340}
          height={520}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Province fills + borders */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E8460A"
                  stroke="#fff"
                  strokeWidth={0.8}
                  style={{
                    default: { outline: 'none' },
                    hover:   { fill: '#C83A08', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Distributor annotations */}
          {DISTRIBUTORS.map((d) => (
            <Annotation
              key={d.name}
              subject={d.coordinates}
              dx={d.dx}
              dy={d.dy}
              connectorProps={{
                stroke: 'rgba(255,255,255,0.7)',
                strokeWidth: 1,
                strokeLinecap: 'round',
              }}
            >
              {/* White pill label */}
              <foreignObject
                x={d.dx > 0 ? 0 : -76}
                y={-14}
                width={76}
                height={30}
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: 999,
                    padding: '2px 7px',
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 4px rgba(0,0,0,.18)',
                    display: 'inline-block',
                  }}
                >
                  {d.name}
                  <br />
                  <span style={{ color: labelColor(d.value), fontSize: 9 }}>
                    {d.value > 0 ? '+' : ''}{d.value} %
                  </span>
                </div>
              </foreignObject>
            </Annotation>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
}
