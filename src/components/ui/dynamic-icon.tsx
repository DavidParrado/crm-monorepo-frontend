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

  // Dynamic import with lazy loading
  const LucideIcon = lazy(dynamicIconImports[iconName]);

  return (
    <Suspense fallback={<LoadingPlaceholder size={props.size} />}>
      <LucideIcon {...props} />
    </Suspense>
  );
}
