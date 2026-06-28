"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function LoginPage() {
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        router.replace('/signin');
    }, [router]);
    return null;
}
//# sourceMappingURL=page.js.map