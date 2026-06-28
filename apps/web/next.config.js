"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    turbopack: {
        root: process.cwd(),
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
};
exports.default = nextConfig;
//# sourceMappingURL=next.config.js.map