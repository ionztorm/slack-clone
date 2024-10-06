import { FaChevronDown } from "react-icons/fa";
import { Button } from "../ui/button";
import { UserAvatar } from "../user-avatar";

type ConversationHeaderProps = {
	memberName?: string;
	memberImage?: string;
	onClick: () => void;
};

export const ConversationHeader = ({
	memberName = "Member",
	memberImage,
	onClick,
}: ConversationHeaderProps) => {
	return (
		<div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
			<Button
				variant="ghost"
				size="sm"
				onClick={onClick}
				className="text-lg font-semibold px-2 overflow-hidden w-auto"
			>
				<UserAvatar
					name={memberName}
					image={memberImage}
					size="sm"
					className="size-6 mr-2"
				/>
				<span className="truncate">{memberName}</span>
				<FaChevronDown className="size-2.5 ml-2" />
			</Button>
		</div>
	);
};
