import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type UserAvatarProps = {
  name?: string;
  image?: string;
  size: "default" | "sm" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-5",
  lg: "size-10",
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
        className,
        size !== "default" && sizes[size],
      )}
    >
      <AvatarImage alt={name} src={image} />
      <AvatarFallback className="rounded-md bg-sky-500 text-slate-200">
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  );
};
