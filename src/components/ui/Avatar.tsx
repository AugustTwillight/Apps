import { getAvatarColor, getInitial } from '../../utils';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };

export default function Avatar({ name, avatar, size = 'md', className = '' }: AvatarProps) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  }
  const color = getAvatarColor(name);
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {getInitial(name)}
    </div>
  );
}
