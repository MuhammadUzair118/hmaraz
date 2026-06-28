interface DataPoint {
    time: string;
    value: number;
}
interface VitalChartProps {
    data: DataPoint[];
    baseline?: number;
    label: string;
    unit: string;
}
export default function VitalChart({ data, baseline, label, unit }: VitalChartProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=VitalChart.d.ts.map