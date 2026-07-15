import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar.tsx'
import Footer from './footer.tsx'

const Layout = () => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onHoverChange={setIsSidebarHovered}
        isHovered={isSidebarHovered}
      />

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-400 ${
          isSidebarHovered ? 'ml-60' : 'ml-20'
        }`}
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* Footer sticks to bottom of visible area unless content pushes it down */}
        <Footer />
      </div>
    </div>
  )
}

export default Layout
