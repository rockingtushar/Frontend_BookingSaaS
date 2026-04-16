import React, { useState, useRef, useEffect} from 'react';
import { Menu,  Loader2} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
}


const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  const { business, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
  const handleClickOutside = (event: PointerEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("pointerdown", handleClickOutside);

  return () => {
    document.removeEventListener("pointerdown", handleClickOutside);
  };
}, []);


  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <div ref={dropdownRef} className="flex items-center gap-3 relative">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{business?.name}</p>
          <p className="text-xs text-gray-500">{business?.email}</p>
        </div>
        <div onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
          {!business ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            business.name
              .split(" ")
              .map(word => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>

        {open && (
          <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg w-40 p-2 z-50">

            <button
              className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded"
            >
              Profile
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Logout
            </button>

          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
