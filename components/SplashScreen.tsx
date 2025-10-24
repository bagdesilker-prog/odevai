import React from 'react';
import { GeminiAvatarIcon } from './icons';

export const SplashScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--on-background)]">
    <div className="animate-welcome-logo">
      <GeminiAvatarIcon className="w-24 h-24" />
    </div>
    <h1 className="text-4xl font-bold mt-6 text-[var(--on-background)] animate-fade-in-up opacity-0">
      Torex AI
    </h1>
  </div>
);