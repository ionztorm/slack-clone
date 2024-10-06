import { UserAvatar } from "../user-avatar";

type ConversationHeroProps = {
	name?: string;
	image?: string;
};

export function ConversationHero({
	name = "Member",
	image,
}: ConversationHeroProps) {
	return (
		<div className="mt-[88px] mx-5 mb-4">
			<div className="flex items-center gap-x-1 mb-2">
				<UserAvatar name={name} image={image} className="size-14 mr-2" />
				<p className="text-2xl font-bold">{name}</p>
			</div>
			<p className="font-normal text-slate-800">
				Conversation between you and <strong>{name}</strong>
			</p>
		</div>
	);
}
