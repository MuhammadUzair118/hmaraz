"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VitalsPage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const BottomNav_1 = __importDefault(require("@/components/BottomNav"));
const VitalChart_1 = __importDefault(require("@/components/VitalChart"));
const MOCK_PERIODS = ['24h', '7d', '30d', '3m'];
const MOCK_VITALS = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: lucide_react_1.Heart, status: 'normal' },
    { label: 'SpO2', value: '98', unit: '%', icon: lucide_react_1.Activity, status: 'normal' },
    { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', icon: lucide_react_1.Droplets, status: 'normal' },
    { label: 'Temperature', value: '36.6', unit: '°C', icon: lucide_react_1.Thermometer, status: 'normal' },
    { label: 'Weight', value: '72.5', unit: 'kg', icon: lucide_react_1.Weight, status: 'normal' },
];
const MOCK_CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 65 + Math.sin(i / 4) * 8 + Math.random() * 5,
}));
function VitalsPage() {
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('24h');
    return (<div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-dark-slate">Vitals</h1>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {MOCK_PERIODS.map((period) => (<button key={period} onClick={() => setSelectedPeriod(period)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-white text-muted-gray shadow-sm hover:text-dark-slate'}`}>
            {period}
          </button>))}
      </div>

      {/* Current Vitals Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {MOCK_VITALS.map((vital, i) => (<div key={i} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <vital.icon size={20} className="text-primary"/>
            </div>
            <div>
              <p className="text-xs text-muted-gray">{vital.label}</p>
              <p className="text-lg font-bold text-dark-slate">{vital.value}</p>
              <p className="text-[10px] text-muted-gray">{vital.unit}</p>
            </div>
          </div>))}
      </div>

      {/* Chart */}
      <VitalChart_1.default data={MOCK_CHART_DATA} baseline={70} label="Heart Rate Trend" unit="bpm"/>

      <BottomNav_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map