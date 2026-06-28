"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const BottomNav_1 = __importDefault(require("@/components/BottomNav"));
function ProfilePage() {
    const router = (0, navigation_1.useRouter)();
    const [user] = (0, react_1.useState)({
        name: 'Ahmed Raza',
        email: 'ahmed@example.com',
        phone: '+92 300 1234567',
        role: 'Patient',
    });
    const menuItems = [
        { icon: lucide_react_1.User, label: 'Health Profile', href: '/onboarding' },
        { icon: lucide_react_1.Bell, label: 'Notifications', href: '#' },
        { icon: lucide_react_1.Smartphone, label: 'Wearable Devices', href: '#' },
        { icon: lucide_react_1.Shield, label: 'Privacy & Security', href: '#' },
        { icon: lucide_react_1.Settings, label: 'Settings', href: '#' },
    ];
    return (<div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Profile Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <lucide_react_1.User size={36} className="text-primary"/>
        </div>
        <h1 className="text-xl font-bold text-dark-slate">{user.name}</h1>
        <p className="text-sm text-muted-gray">{user.email}</p>
        <p className="text-xs text-muted-gray">{user.phone}</p>
        <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {user.role}
        </span>
      </div>

      {/* Menu */}
      <div className="space-y-1 rounded-xl bg-white shadow-sm">
        {menuItems.map((item, i) => (<button key={i} onClick={() => item.href !== '#' && router.push(item.href)} className="flex w-full items-center justify-between px-4 py-3.5 transition hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-muted-gray"/>
              <span className="text-sm font-medium text-dark-slate">{item.label}</span>
            </div>
            <lucide_react_1.ChevronRight size={18} className="text-muted-gray"/>
          </button>))}
      </div>

      {/* Subscription */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-primary to-sky-accent p-4 text-white">
        <p className="text-xs font-medium uppercase opacity-80">Current Plan</p>
        <p className="text-lg font-bold">Hamraz Basic</p>
        <p className="text-sm opacity-80">Free tier · Core monitoring + AI chat</p>
      </div>

      {/* Logout */}
      <button onClick={() => router.push('/signin')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-danger shadow-sm transition hover:bg-red-50">
        <lucide_react_1.LogOut size={18}/>
        Sign Out
      </button>

      <BottomNav_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map