"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
exports.metadata = {
    title: 'Hamraz — Your AI Health Companion',
    description: 'Personalized AI-powered health monitoring and wellness management.',
};
function RootLayout({ children }) {
    return (<html lang="en">
      <body className="min-h-screen bg-bg antialiased">
        {children}
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map