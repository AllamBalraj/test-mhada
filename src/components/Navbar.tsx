import { useState } from "react";
import { Menu, X, Home, Bell, HelpCircle, User } from "lucide-react";

export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center font-semibold tracking-wide animate-pulse">
            Disclaimer: This isn’t an official MHADA website. It’s made only to show how the site could look and feel more user-friendly.
          </p>
        </div>
      </div>

      {/* <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">MHADA</h1>
              <p className="text-xs text-gray-500 leading-tight hidden sm:block">Affordable Housing Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {["Lotteries", "About", "Schemes", "Downloads", "Contact"].map((label) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-1 p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all relative" type="button">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="hidden md:flex items-center gap-1 p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" type="button">
              <HelpCircle size={18} />
            </button>
            <button className="hidden md:flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-all shadow-sm" type="button">
              <User size={15} />
              Login / Register
            </button>
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen((v) => !v)}
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-1">
          {["Lotteries", "About", "Schemes", "Downloads", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
            >
              {item}
            </a>
          ))}
          <button className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium" type="button">
            <User size={15} />
            Login / Register
          </button>
        </div>
      )} */}
    </nav>
  );
}
