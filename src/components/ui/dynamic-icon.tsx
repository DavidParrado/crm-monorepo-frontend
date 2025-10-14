import { lazy, Suspense, ComponentType } from "react";
import { LucideProps, HelpCircle } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  fallback?: ComponentType<LucideProps>;
}

const LoadingPlaceholder = ({ size = 24 }: { size?: number | string }) => {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <div 
      style={{ width: sizeNum, height: sizeNum }} 
      className="bg-muted animate-pulse rounded"
    />
  );
};

const FallbackIcon = ({ size = 24, ...props }: LucideProps) => (
  <HelpCircle size={size} {...props} className="text-muted-foreground" />
);

// Cache for lazily imported icons to prevent re-suspense/flicker
const iconCache = new Map<string, ComponentType<LucideProps>>();

function getLazyIcon(name: keyof typeof dynamicIconImports) {
  const cached = iconCache.get(name as string);
  if (cached) return cached;
  const Comp = lazy(dynamicIconImports[name]) as unknown as ComponentType<LucideProps>;
  iconCache.set(name as string, Comp);
  return Comp;
}

export function DynamicIcon({ name, fallback: CustomFallback, ...props }: DynamicIconProps) {
  // Guard clause: validate input
  if (!name || typeof name !== "string" || name.trim() === "") {
    const Fallback = CustomFallback || FallbackIcon;
    return <Fallback {...props} />;
  }

  // Check if icon exists in the dynamic imports map
  const iconName = name as keyof typeof dynamicIconImports;
  
  if (!dynamicIconImports[iconName]) {
    const Fallback = CustomFallback || FallbackIcon;
    return <Fallback {...props} />;
  }

  // Dynamic import with lazy loading using cache to avoid flicker
  const LucideIcon = getLazyIcon(iconName);

  return (
    <Suspense fallback={<LoadingPlaceholder size={props.size} />}>
      <LucideIcon {...props} />
    </Suspense>
  );
}
