"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VitalRing;
function VitalRing({ label, value, unit, status = 'normal', color }) {
    const statusColor = color ?? (status === 'danger' ? '#DC2626' :
        status === 'warning' ? '#D97706' :
            '#059669');
    return (<div className="flex flex-col items-center gap-1">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-4" style={{ borderColor: statusColor }}>
        <span className="text-2xl font-bold" style={{ color: statusColor }}>
          {value}
        </span>
      </div>
      <span className="text-xs font-medium text-muted-gray">{label}</span>
      <span className="text-xs text-muted-gray">{unit}</span>
    </div>);
}
//# sourceMappingURL=VitalRing.js.map