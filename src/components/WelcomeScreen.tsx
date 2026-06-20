import React, { useEffect, useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out at 3.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    // Call onComplete at 4 seconds to unmount
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 bg-slate-900/90 backdrop-blur-md ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* The Container */}
      <div className={`relative flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-20'}`}>
        
        {/* Left Side: Animated Gradient/Image */}
        <div className="relative w-full md:w-72 h-56 md:h-auto bg-indigo-600 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          {/* Subtle moving pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 animate-[pan_20s_linear_infinite]"></div>
          
          {/* Decorative Circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Animated User Avatar */}
            <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl animate-[spin-slow_15s_linear_infinite]">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl shadow-inner animate-[spin-reverse_15s_linear_infinite]">
                  👋
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="p-8 sm:p-10 md:p-14 flex flex-col justify-center min-w-0 sm:min-w-[340px] w-full">
          <div className="overflow-hidden mb-2">
            <h2 className="text-sm font-extrabold text-indigo-500 tracking-[0.2em] uppercase animate-[slide-up_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.4s' }}>
              Welcome Back
            </h2>
          </div>
          
          <div className="overflow-hidden mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white animate-[slide-up_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.6s' }}>
              I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Pavithiran</span>
            </h1>
          </div>

          <div className="overflow-hidden mb-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg animate-[slide-up_0.6s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.8s' }}>
              Thanks for giving this opportunity.
            </p>
          </div>

          {/* Modern Progress Indicator */}
          <div className="mt-auto animate-[fade-in_1s_ease-out_forwards] opacity-0" style={{ animationDelay: '1.2s' }}>
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 tracking-widest uppercase">
              <span>Loading System</span>
              <span className="animate-[pulse_2s_infinite]">100%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[progress-bar_3.5s_ease-in-out_forwards]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
