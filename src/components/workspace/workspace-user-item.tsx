import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "../user-avatar";

type UserItemProps = {
	id: Id<"members">;
	label?: string;
	image?: string;
	variant?: VariantProps<typeof userItemVariants>["variant"];
};

const userItemVariants = cva(
	"flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
	{
		variants: {
			variant: {
				default: "text-[#F9edffcc]",
				active: "text-[#481349] bg-white/90 hover:bg-white/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const UserItem = ({
	id,
	label = "Member",
	image,
	variant,
}: UserItemProps) => {
	const workspaceId = useWorkspaceId();
	return (
		<Button
			variant="transparent"
			className={cn(userItemVariants({ variant }))}
			size="sm"
			asChild
		>
			<Link href={`/workspace/${workspaceId}/member/${id}`}>
				<UserAvatar className="mr-1" name={label} image={image} size="sm" />
				<span className="text-sm truncate">{label}</span>
			</Link>
		</Button>
	);
};
