interface VitalRingProps {
    label: string;
    value: string | number;
    unit: string;
    status?: 'normal' | 'warning' | 'danger';
    color?: string;
}
export default function VitalRing({ label, value, unit, status, color }: VitalRingProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=VitalRing.d.ts.map