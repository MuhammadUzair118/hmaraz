"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BottomNav;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const navItems = [
    { href: '/', label: 'Home', icon: lucide_react_1.Home },
    { href: '/chat', label: 'AI Chat', icon: lucide_react_1.MessageCircle },
    { href: '/vitals', label: 'Vitals', icon: lucide_react_1.Heart },
];
function BottomNav() {
    const pathname = (0, navigation_1.usePathname)();
    return (<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 pb-2 pt-1">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (<link_1.default key={href} href={href} className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-gray hover:text-dark-slate'}`}>
              <Icon size={22}/>
              <span>{label}</span>
            </link_1.default>);
        })}
      </div>
    </nav>);
}
//# sourceMappingURL=BottomNav.js.map