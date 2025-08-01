// components/Layout.tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar.tsx'

const Layout = () => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar 
        onHoverChange={setIsSidebarHovered}
        isHovered={isSidebarHovered}
      />
      <main className={`main-content transition-all duration-400 ${
        isSidebarHovered ? 'ml-60' : 'ml-20'
      }`}>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout