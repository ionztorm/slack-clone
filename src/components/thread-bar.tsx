import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "./user-avatar";

type ThreadBarProps = {
	count?: number;
	image?: string;
	timeStamp?: number;
	name?: string;
	onClick?: () => void;
};

export function ThreadBar({
	count,
	image,
	timeStamp,
	name = "Member",
	onClick,
}: ThreadBarProps) {
	if (!count || !timeStamp) return null;

	return (
		<button
			onClick={onClick}
			className="p-1 rounded-md hover:bg-white border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
			type="button"
		>
			<div className="flex items-center gap-2 overflow-hidden">
				<UserAvatar className="size-6 shrink-0" name={name} image={image} />
				<span className="text-xs text-sky-700 hover:underline font-bold truncate">
					{count} {count === 1 ? "reply" : "replies"}
				</span>
				<span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
					Last reply {formatDistanceToNow(timeStamp, { addSuffix: true })}
				</span>
				<span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
					View thread
				</span>
			</div>
			<ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
		</button>
	);
}
