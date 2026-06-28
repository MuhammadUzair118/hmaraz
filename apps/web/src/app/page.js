"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const BottomNav_1 = __importDefault(require("@/components/BottomNav"));
const VitalRing_1 = __importDefault(require("@/components/VitalRing"));
const supabase_1 = require("@/lib/supabase");
const MOCK_VITALS = {
    heart_rate: { value: 72, unit: 'bpm', status: 'normal' },
    spo2: { value: 98, unit: '%', status: 'normal' },
    steps: { value: 6842, unit: 'steps', status: 'normal' },
};
const MOCK_INSIGHT = "Your HRV is 12% above your baseline today — a great day for exercise. Your sleep score improved 15 points from last week.";
function Dashboard() {
    const router = (0, navigation_1.useRouter)();
    const [checking, setChecking] = (0, react_1.useState)(true);
    const [insight, setInsight] = (0, react_1.useState)(MOCK_INSIGHT);
    const [vitals] = (0, react_1.useState)(MOCK_VITALS);
    const [alerts] = (0, react_1.useState)([
        { level: 1, message: 'Heart rate slightly elevated during rest period', metric: 'heart_rate' },
    ]);
    (0, react_1.useEffect)(() => {
        async function checkAuth() {
            const { data: { session } } = await (0, supabase_1.createClient)().auth.getSession();
            if (!session) {
                router.replace('/signin');
            }
            else {
                setChecking(false);
            }
        }
        checkAuth();
    }, [router]);
    if (checking) {
        return (<div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
      </div>);
    }
    return (<div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* AI Agent Greeting */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-primary to-sky-accent p-4 text-white">
        <div className="mb-1 flex items-center gap-2">
          <lucide_react_1.MessageCircle size={18}/>
          <span className="text-sm font-semibold">Hamraz AI</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{insight}</p>
      </div>

      {/* Vitals Ring */}
      <h2 className="mb-3 text-lg font-semibold text-dark-slate">Your Vitals</h2>
      <div className="mb-6 flex justify-around rounded-xl bg-white p-4 shadow-sm">
        <VitalRing_1.default label="Heart Rate" value={vitals.heart_rate.value} unit={vitals.heart_rate.unit} status={vitals.heart_rate.status}/>
        <VitalRing_1.default label="SpO2" value={vitals.spo2.value} unit={vitals.spo2.unit} status={vitals.spo2.status}/>
        <VitalRing_1.default label="Steps" value={vitals.steps.value} unit={vitals.steps.unit} status={vitals.steps.status}/>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (<div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-dark-slate">Active Alerts</h3>
          {alerts.map((alert, i) => (<div key={i} className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <lucide_react_1.TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning"/>
              <div>
                <span className="text-xs font-medium text-warning">Level {alert.level}</span>
                <p className="text-sm text-dark-slate">{alert.message}</p>
              </div>
            </div>))}
        </div>)}

      {/* Quick Actions */}
      <h3 className="mb-3 text-sm font-semibold text-dark-slate">Quick Actions</h3>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <link_1.default href="/chat" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <lucide_react_1.MessageCircle size={24} className="text-sky-accent"/>
          <span className="text-sm font-medium text-dark-slate">AI Chat</span>
        </link_1.default>
        <link_1.default href="/sos" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <lucide_react_1.TriangleAlert size={24} className="text-danger"/>
          <span className="text-sm font-medium text-danger">SOS</span>
        </link_1.default>
        <link_1.default href="/vitals" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <lucide_react_1.Activity size={24} className="text-primary"/>
          <span className="text-sm font-medium text-dark-slate">Vitals</span>
        </link_1.default>
      </div>

      {/* Daily Streak */}
      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-dark-slate">Daily Streak</span>
          <span className="text-lg font-bold text-primary">7 days</span>
        </div>
        <div className="mt-2 flex gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (<div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-xs font-medium text-success">
              {day}
            </div>))}
        </div>
      </div>

      <BottomNav_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map