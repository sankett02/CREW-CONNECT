import React from 'react';

interface VideoHeroProps {
    videoSrc: string;
    title: React.ReactNode;
    subtitle: React.ReactNode; // Changed to Node for more flexibility
    action?: React.ReactNode;
    overlayColor?: string;
    opacity?: number;
    height?: string;
    fullScreen?: boolean;
    videoBlur?: string;
}

const VideoHero: React.FC<VideoHeroProps> = ({ 
    videoSrc, 
    title, 
    subtitle, 
    action, 
    overlayColor = 'rgba(8, 13, 30, 0.65)', 
    height = "600px",
    fullScreen = false,
    videoBlur = "blur-[2px]"
}) => {
    return (
        <div 
            className={`relative w-full overflow-hidden ${fullScreen ? 'min-h-screen' : ''}`}
            style={!fullScreen ? { height } : {}}
        >
            {/* Video Layer */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${videoBlur}`}
            >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Premium Overlay */}
            <div 
                className="absolute inset-0 backdrop-blur-[3px] flex flex-col justify-start items-center text-center px-6 pt-20 md:pt-24"
                style={{ 
                    background: `linear-gradient(180deg, #080d1a 0%, transparent 40%), radial-gradient(circle at center, transparent 0%, ${overlayColor} 100%), linear-gradient(0deg, #080d1a 0%, transparent 50%)`,
                }}
            >
                <div className="max-w-4xl space-y-4 animate-in fade-in zoom-in duration-1000">
                    <div className="space-y-2">
                        <div className="flex flex-col items-center">
                            {title}
                        </div>
                        <div className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
                            {subtitle}
                        </div>
                    </div>
                    {action && (
                        <div className="flex justify-center pt-4">
                            {action}
                        </div>
                    )}
                </div>
            </div>
            {/* Bottom Gradient for seamless section transition */}
            {fullScreen && (
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#080d1a] to-transparent pointer-events-none" />
            )}
        </div>
    );
};

export default VideoHero;
