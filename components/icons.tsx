import React from 'react';

type IconProps = {
  className?: string;
};

const MaterialSymbol: React.FC<{ name: string, className?: string, filled?: boolean }> = ({ name, className, filled }) => (
  <span 
    className={`material-symbols-outlined ${className}`} 
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

export const MenuIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="menu" className={className} />;
export const UserAvatarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);
export const SpeakerIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="volume_up" className={className} />;
export const CopyIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="content_copy" className={className} />;
export const SendIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="send" className={className} />;
export const ImageIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="image" className={className} />;
export const CameraIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="photo_camera" className={className} />;
export const MicIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="mic" className={className} />;
export const CloseIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="close" className={className} />;
export const StopCircleIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="stop_circle" className={className} filled />;
export const PlusIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="add" className={className} />;
export const HomeIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="home" className={className} />;
export const SunIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="light_mode" className={className} />;
export const MoonIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="dark_mode" className={className} filled />;
export const LogoutIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="logout" className={className} />;
export const TrashIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="delete" className={className} />;
export const SettingsIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="settings" className={className} />;
export const GeminiAvatarIcon: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="hsl(var(--primary-hue, 210), 85%, 55%)" />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="white" fontSize="22" fontWeight="bold" fontFamily="Roboto, sans-serif">
            T
        </text>
    </svg>
);
export const ChatBubbleIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="chat_bubble" className={className} />;
export const DatabaseIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="database" className={className} />;
export const ExternalLinkIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="open_in_new" className={className} />;
export const PaletteIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="palette" className={className} />;
export const ModelIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="hub" className={className} />;
export const VoiceIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="keyboard_voice" className={className} />;
export const QuizIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="quiz" className={className} />;
export const ProfileIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol name="account_circle" className={className} />;
