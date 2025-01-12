import Image from "next/image";
import clsx from "clsx";

export function HeroFrame({
  className,
  children,
  priority = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { priority?: boolean }) {
  return (
    <div className={clsx("relative aspect-[366/729]", className)} {...props}>
      <div className="absolute inset-y-[calc(1/729*100%)] left-[calc(7/729*100%)] right-[calc(5/729*100%)] flex items-center justify-center shadow-2xl" />
      <div className="absolute left-[calc(23/366*100%)] top-[calc(23/729*100%)] mt-32 w-[calc(318/366*100%)] transform grid-cols-1 overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
