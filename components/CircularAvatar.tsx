import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CircularAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  alt?: string;
  className?: string;
}

export default function CircularAvatar({ 
  src, 
  fallback, 
  alt = 'Avatar',
  className = 'w-16 h-16',
  ...props
}: CircularAvatarProps) {
  return (
    <div className={`${className} relative flex-shrink-0`} {...props}>
      {/* Avatar container - properly circular with overflow hidden */}
      <div className="w-full h-full relative overflow-hidden rounded-full border-2 border-yellow-400 shadow-lg bg-gradient-to-br from-blue-900 to-blue-700">
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
            {fallback.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
