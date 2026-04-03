import React from 'react';
import LoginComponent from '../components/auth/LoginComponent';

const Login: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
            {/* Background glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-sky-600/6 rounded-full blur-3xl" />
            </div>

            <LoginComponent />
        </div>
    );
};

export default Login;
