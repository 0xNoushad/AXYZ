import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type HTMLAttributes, createContext, useContext } from 'react';

type BadgeContextType = {
  themed: boolean;
};

const BadgeContext = createContext<BadgeContextType>({
  themed: false,
});

const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadgeContext must be used within a Badge');
  }
  return context;
};

export type AnnouncementProps = BadgeProps & {
  themed?: boolean;
};

export const Announcement = ({
  variant = 'secondary',
  className,
  ...props
}: AnnouncementProps) => (
  <BadgeContext.Provider value={{ themed: false }}>
    <Badge
      variant={variant}
      className={cn(
        'max-w-full gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-0.5 font-medium shadow-md',
        className
      )}
      {...props}
    />
  </BadgeContext.Provider>
);

export type AnnouncementTagProps = HTMLAttributes<HTMLDivElement>;

export const AnnouncementTag = ({
  className,
  ...props
}: AnnouncementTagProps) => (
  <div
    className={cn(
      '-ml-2.5 shrink-0 truncate rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs shadow-md',
      className
    )}
    {...props}
  />
);

export type AnnouncementTitleProps = HTMLAttributes<HTMLDivElement>;

export const AnnouncementTitle = ({
  className,
  ...props
}: AnnouncementTitleProps) => (
  <div
    className={cn(
      'flex items-center gap-1 truncate py-1 text-emerald-700',
      className
    )}
    {...props}
  />
);
