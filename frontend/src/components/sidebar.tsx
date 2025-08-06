import { Link, useLocation } from 'react-router-dom'
import cnxLogo from "../assets/cnxLogo.png";
import cnxText from "../assets/cnxText.png";
import scanLogo from "../assets/scanLogo.png";
import internsLogo from "../assets/internsLogo.png";
import attendanceLogo from "../assets/attendanceLogo.png";
import historyLogo from "../assets/historyLogo.png";

// Utility to join class names conditionally
const cn = (...classes: (string | boolean | null | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Add this interface for props
interface SidebarProps {
  onHoverChange: (isHovered: boolean) => void;
  isHovered: boolean;
}

// Update the component signature to accept props
const Sidebar: React.FC<SidebarProps> = ({ onHoverChange, isHovered }) => {
  const location = useLocation()

  const menuItems = [
    { label: 'Scan', icon: scanLogo, path: '/' },
    { label: 'Interns', icon: internsLogo, path: '/interns' },
    { label: 'Attendance', icon: attendanceLogo, path: '/attendance' },
    { label: 'History', icon: historyLogo, path: '/history' },
  ];

  // Get current active item based on location
  const getCurrentActiveItem = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Scan';
  };

  // Update these handlers to use the prop function
  const handleMouseEnter = () => {
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    onHoverChange(false);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-[#253850] rounded-tr-lg rounded-br-lg transition-all duration-400',
        isHovered ? 'w-60' : 'w-20'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full px-3 py-4 items-center">
        <div className="mb-10">
          <Link to="/" className="flex items-center">
            <img
              src={cnxLogo}
              className="h-10 "
              alt="cnx Logo"
            />

            {isHovered && 
            <Link to="/" className="flex">
            <img
              src={cnxText}
              className="h-4 ml-4"
              alt="cnx Text Logo"
            />
            </Link>}
          </Link>
        </div>

        <ul className="space-y-4 font-medium ml-1">
          {menuItems.map(({ label, icon, path }) => (
            <li key={label}>
              <Link
                to={path}
                className={cn(
                  'flex items-center p-2 text-gray-50 font-semibold rounded-md dark:text-white transition-colors duration-200',
                  getCurrentActiveItem() === label
                    ? 'bg-[#235873]'
                    : 'hover:bg-gray-100 hover:bg-opacity-30'
                )}
              >
                <div className={cn(
                  'flex items-center w-full',
                  isHovered ? 'justify-start' : 'justify-center'
                )}>
                  <img src={icon} alt={`${label} icon`} className="w-7 h-7" />
                  {isHovered && (
                    <span className="ml-4 whitespace-nowrap">{label}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;