"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SosPage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const BottomNav_1 = __importDefault(require("@/components/BottomNav"));
function SosPage() {
    const router = (0, navigation_1.useRouter)();
    const [activated, setActivated] = (0, react_1.useState)(false);
    const [countdown, setCountdown] = (0, react_1.useState)(0);
    const handleSos = () => {
        setActivated(true);
        setCountdown(5);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    return (<div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg">
      {!activated ? (<div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
              <lucide_react_1.TriangleAlert size={40} className="text-danger"/>
            </div>
            <h1 className="text-2xl font-bold text-dark-slate">Emergency SOS</h1>
            <p className="mt-2 text-sm text-muted-gray">
              Press the button below to send an emergency alert with your location and health profile to your emergency contacts.
            </p>
          </div>

          <button onClick={handleSos} className="flex h-40 w-40 items-center justify-center rounded-full bg-danger text-white shadow-2xl transition hover:bg-danger/90 active:scale-95">
            <div className="text-center">
              <lucide_react_1.TriangleAlert size={48} className="mx-auto mb-1 animate-pulse"/>
              <span className="text-lg font-bold">SOS</span>
            </div>
          </button>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-gray">
            <lucide_react_1.Shield size={14}/>
            Your location and health data will be shared with your emergency contacts
          </div>
        </div>) : (<div className="flex flex-1 flex-col items-center justify-center bg-danger px-4 text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <lucide_react_1.TriangleAlert size={36}/>
          </div>

          <h1 className="mb-2 text-2xl font-bold">Emergency Alert Sent</h1>
          <p className="mb-6 text-center text-white/80">
            {countdown > 0
                ? `Alerting emergency contacts in ${countdown}...`
                : 'Your emergency contacts have been notified.'}
          </p>

          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <lucide_react_1.MapPin size={20}/>
              <div>
                <p className="text-xs opacity-80">Location</p>
                <p className="text-sm font-medium">Karachi, Pakistan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <lucide_react_1.Heart size={20}/>
              <div>
                <p className="text-xs opacity-80">Health Profile Shared</p>
                <p className="text-sm font-medium">Blood type, allergies, conditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <lucide_react_1.Phone size={20}/>
              <div>
                <p className="text-xs opacity-80">Contacts Notified</p>
                <p className="text-sm font-medium">3 emergency contacts</p>
              </div>
            </div>
          </div>

          <button onClick={() => router.push('/')} className="mt-8 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-danger transition hover:bg-white/90">
            Return to Home
          </button>
        </div>)}

      <BottomNav_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map