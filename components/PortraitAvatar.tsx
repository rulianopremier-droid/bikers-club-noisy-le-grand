import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PortraitAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  alt?: string;
  className?: string;
}

export default function PortraitAvatar({ 
  src, 
  fallback, 
  alt = 'Avatar',
  className = 'w-32 h-32',
  ...props
}: PortraitAvatarProps) {
  return (
    <div className={`${className} relative flex-shrink-0`} {...props}>
      {/* Avatar container - Square format (1:1) with yellow border */}
      <div className="w-full h-full relative overflow-hidden rounded-md border-2 border-yellow-400 shadow-lg bg-gradient-to-br from-blue-900 to-blue-700">
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
            {fallback.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
