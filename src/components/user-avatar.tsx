import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type UserAvatarProps = {
  name?: string;
  image?: string;
  size?: "sm" | "lg" | "profile";
  className?: string;
};

const sizes = {
  sm: "size-5",
  lg: "size-10",
  profile: "max-w-[256px] max-h-[256px] size-full",
};

export const UserAvatar = ({
  name,
  image,
  size = "lg",
  className,
}: UserAvatarProps) => {
  const avatarFallback = name?.charAt(0).toUpperCase();
  return (
    <Avatar
      className={cn(
        "rounded-md hover:opacity-75 transition",
        sizes[size],
        className,
      )}
    >
      <AvatarImage alt={name} src={image} />
      <AvatarFallback
        className={cn(
          "rounded-md bg-sky-500 text-slate-200 font-bold aspect-square",
          size === "sm" && "text-xs",
          size === "profile" && "text-6xl",
        )}
      >
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  );
};
