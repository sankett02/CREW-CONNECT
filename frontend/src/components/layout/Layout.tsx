import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col text-[#f0f4ff]">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
