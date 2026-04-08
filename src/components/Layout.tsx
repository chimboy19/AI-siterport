import {useState} from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }:LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
  return (
  <div className="min-h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-64 print:pl-0 flex flex-col min-h-screen">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default Layout
