'use client';

import { ChartComponent } from '@/lib/types/constructor';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PreviewChartProps {
    component: ChartComponent;
}

// Datos simulados para diferentes tipos de gráficos
const SIMULATED_DATA = {
    'generation-mix': [
        { name: 'Térmica', value: 45, color: '#FF7A00' },
        { name: 'Hidráulica', value: 25, color: '#3B82F6' },
        { name: 'Nuclear', value: 15, color: '#8B5CF6' },
        { name: 'Renovable', value: 15, color: '#10B981' },
    ],
    'demand-trend': [
        { month: 'Ene', demand: 1200, variation: 5.2 },
        { month: 'Feb', demand: 1150, variation: -2.1 },
        { month: 'Mar', demand: 1300, variation: 8.7 },
        { month: 'Apr', demand: 1250, variation: 3.2 },
        { month: 'May', demand: 1400, variation: 12.0 },
        { month: 'Jun', demand: 1350, variation: -3.6 },
        { month: 'Jul', demand: 1500, variation: 11.1 },
        { month: 'Ago', demand: 1450, variation: -3.3 },
        { month: 'Sep', demand: 1380, variation: -4.8 },
        { month: 'Oct', demand: 1420, variation: 2.9 },
        { month: 'Nov', demand: 1320, variation: -7.0 },
        { month: 'Dec', demand: 1280, variation: -3.0 },
    ],
    'cost-comparison': [
        { category: 'CAMMESA', cost: 45.2, budget: 50.0 },
        { category: 'PLUS', cost: 38.7, budget: 40.0 },
        { category: 'Renovable', cost: 42.1, budget: 45.0 },
        { category: 'Distribución', cost: 28.5, budget: 30.0 },
    ],
    'multi-series': [
        { month: 'Ene', serie1: 120, serie2: 80, serie3: 95 },
        { month: 'Feb', serie1: 115, serie2: 85, serie3: 90 },
        { month: 'Mar', serie1: 130, serie2: 90, serie3: 100 },
        { month: 'Apr', serie1: 125, serie2: 88, serie3: 105 },
        { month: 'May', serie1: 140, serie2: 95, serie3: 110 },
        { month: 'Jun', serie1: 135, serie2: 92, serie3: 108 },
    ],
    'custom-bar': [
        { category: 'Zona Norte', value: 850 },
        { category: 'Zona Centro', value: 1200 },
        { category: 'Zona Sur', value: 950 },
        { category: 'Zona Este', value: 1100 },
        { category: 'Zona Oeste', value: 800 },
    ],
    'custom-line': [
        { time: '00:00', value: 450 },
        { time: '04:00', value: 380 },
        { time: '08:00', value: 650 },
        { time: '12:00', value: 820 },
        { time: '16:00', value: 750 },
        { time: '20:00', value: 680 },
    ],
    'custom-pie': [
        { name: 'Categoría A', value: 35, color: '#FF7A00' },
        { name: 'Categoría B', value: 28, color: '#3B82F6' },
        { name: 'Categoría C', value: 22, color: '#10B981' },
        { name: 'Categoría D', value: 15, color: '#8B5CF6' },
    ],
};

export function PreviewChart({ component }: PreviewChartProps) {
    const data = SIMULATED_DATA[component.type] || [];
    const colors = component.config.colors || ['#FF7A00', '#3B82F6', '#10B981', '#8B5CF6'];

    const renderChart = () => {
        switch (component.type) {
            case 'generation-mix':
            case 'custom-pie':
                return (
                    <ResponsiveContainer width="100%" height={component.config.height || 300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.name} ${entry.percent ? (entry.percent * 100).toFixed(0) : entry.value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                                ))}
                            </Pie>
                            {component.config.showTooltip && <Tooltip />}
                            {component.config.showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'demand-trend':
            case 'custom-line':
                return (
                    <ResponsiveContainer width="100%" height={component.config.height || 300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={component.type === 'demand-trend' ? 'month' : 'time'} />
                            <YAxis />
                            {component.config.showTooltip && <Tooltip />}
                            {component.config.showLegend && <Legend />}
                            <Line
                                type="monotone"
                                dataKey={component.type === 'demand-trend' ? 'demand' : 'value'}
                                stroke={colors[0]}
                                strokeWidth={2}
                                dot={{ fill: colors[0] }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'cost-comparison':
            case 'custom-bar':
                return (
                    <ResponsiveContainer width="100%" height={component.config.height || 300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            {component.config.showTooltip && <Tooltip />}
                            {component.config.showLegend && <Legend />}
                            <Bar dataKey={component.type === 'cost-comparison' ? 'cost' : 'value'} fill={colors[0]} />
                            {component.type === 'cost-comparison' && (
                                <Bar dataKey="budget" fill={colors[1]} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'multi-series':
                return (
                    <ResponsiveContainer width="100%" height={component.config.height || 300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            {component.config.showTooltip && <Tooltip />}
                            {component.config.showLegend && <Legend />}
                            <Line type="monotone" dataKey="serie1" stroke={colors[0]} strokeWidth={2} />
                            <Line type="monotone" dataKey="serie2" stroke={colors[1]} strokeWidth={2} />
                            <Line type="monotone" dataKey="serie3" stroke={colors[2]} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900">Gráfico {component.type}</p>
                            <p className="text-xs text-gray-500 mt-1">Vista previa no disponible</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {renderChart()}

            {/* Chart info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Tipo: {component.type}</span>
                    <span>Datos simulados para demo</span>
                </div>
            </div>
        </div>
    );
}