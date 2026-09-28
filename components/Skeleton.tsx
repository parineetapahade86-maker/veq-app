// components/Skeleton.tsx

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-cream-deep ${className || ""}`}
            {...props}
        />
    )
}