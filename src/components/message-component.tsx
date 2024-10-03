import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Hint } from "./hint";
import { MessageToolbar } from "./message-toolbar";
import { Reactions } from "./reactions-bar";
import { Thumbnail } from "./thumbnail";
import { UserAvatar } from "./user-avatar";

const Renderer = dynamic(() => import("@/components/message-renderer"), {
	ssr: false,
});

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

type MessageProps = {
	id: Id<"messages">;
	memberId: Id<"members">;
	authorName?: string;
	authorImage?: string;
	isAuthor: boolean;
	reactions: Array<
		Omit<Doc<"reactions">, "memberId"> & {
			count: number;
			memberIds: Id<"members">[];
		}
	>;
	body: Doc<"messages">["body"];
	image: string | null | undefined;
	updatedAt: Doc<"messages">["updatedAt"];
	createdAt: Doc<"messages">["_creationTime"];
	threadCount?: number;
	threadImage?: string;
	threadTimestamp?: number;
	isEditing: boolean;
	setEditingId: (id: Id<"messages"> | null) => void;
	isCompact: boolean;
	hideThreadButton: boolean;
};

const formatFullTime = (date: Date) =>
	`${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;

export function Message({
	id,
	memberId,
	authorName = "Member",
	authorImage,
	isAuthor,
	reactions,
	body,
	image,
	updatedAt,
	createdAt,
	threadTimestamp,
	threadImage,
	threadCount,
	isEditing,
	setEditingId,
	isCompact,
	hideThreadButton,
}: MessageProps) {
	const [ConfirmDialog, confirm] = useConfirm(
		"Delete message",
		"Are you sure? This action is irreversable",
	);

	const { mutate: updateMessage, isPending } = useUpdateMessage();
	const { mutate: removeMessage, isPending: isRemovingMessage } =
		useRemoveMessage();
	const { mutate: toggleReaction, isPending: isTogglingReaction } =
		useToggleReaction();

	const handleReaction = (value: string) => {
		toggleReaction(
			{ messageId: id, value },
			{
				onError: () => {
					toast.error("Failed to toggle reaction");
				},
			},
		);
	};

	const handleUpdate = ({ body }: { body: string }) => {
		updateMessage(
			{ id, body },
			{
				onSuccess: () => {
					toast.success("Message updated");
					setEditingId(null);
				},
				onError: () => {
					toast.error("Unable to update message.");
				},
			},
		);
	};

	const handleRemoveMessage = async () => {
		const ok = await confirm();

		if (!ok) return;

		removeMessage(
			{ id },
			{
				onSuccess: () => {
					toast.success("Message deleted");

					// TODO : Close thread if opened
				},
				onError: () => {
					toast.error("Unable to delete message.");
				},
			},
		);
	};

	if (isCompact)
		return (
			<>
				<ConfirmDialog />
				<div
					className={cn(
						"flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
						isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
						isRemovingMessage &&
							"bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
					)}
				>
					<div className="flex items-start gap-2">
						<Hint label={formatFullTime(new Date(createdAt))}>
							<button
								className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-10 leading-[22px] text-center hover:underline min-w-10"
								type="button"
							>
								{format(new Date(createdAt), "hh:mm")}
							</button>
						</Hint>
						{isEditing ? (
							<div className="w-full h-full">
								<Editor
									onSubmit={handleUpdate}
									disabled={isPending}
									defaultValue={JSON.parse(body)}
									onCancel={() => setEditingId(null)}
									variant="update"
								/>
							</div>
						) : (
							<div className="flex flex-col w-full">
								<Renderer value={body} />
								<Thumbnail url={image} />
								{updatedAt ? (
									<span className="text-xs text-muted-foreground">
										(edited)
									</span>
								) : null}
								<Reactions reactions={reactions} onChange={handleReaction} />
							</div>
						)}
					</div>
					{!isEditing && (
						<MessageToolbar
							isAuthor={isAuthor}
							isPending={isPending}
							hideThreadButton={hideThreadButton}
							handleEdit={() => setEditingId(id)}
							handleDelete={handleRemoveMessage}
							handleThread={() => {}}
							handleReaction={handleReaction}
						/>
					)}
				</div>
			</>
		);

	return (
		<>
			<ConfirmDialog />
			<div
				className={cn(
					"flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
					isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
					isRemovingMessage &&
						"bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
				)}
			>
				<div className="flex items-start gap-2">
					<button type="button">
						<UserAvatar name={authorName} image={authorImage} size="lg" />
					</button>
					{isEditing ? (
						<div className="w-full h-full">
							<Editor
								onSubmit={handleUpdate}
								disabled={isPending}
								defaultValue={JSON.parse(body)}
								onCancel={() => setEditingId(null)}
								variant="update"
							/>
						</div>
					) : (
						<div className="flex flex-col w-full overflow-hidden">
							<div className="text-sm">
								<button
									onClick={() => {}}
									type="button"
									className="font-bold text-primary hover:underline"
								>
									{authorName}
								</button>
								<span>&nbsp;&nbsp;</span>
								<Hint label={formatFullTime(new Date(createdAt))}>
									<button
										type="button"
										className="text-xs text-muted-foreground hover:underline"
									>
										{format(new Date(createdAt), "h:mm a")}
									</button>
								</Hint>
							</div>
							<Renderer value={body} />
							<Thumbnail url={image} />
							{updatedAt ? (
								<span className="text-xs text-muted-foreground">(edited)</span>
							) : null}
							<Reactions reactions={reactions} onChange={handleReaction} />
						</div>
					)}
				</div>
				{!isEditing && (
					<MessageToolbar
						isAuthor={isAuthor}
						isPending={isPending}
						hideThreadButton={hideThreadButton}
						handleEdit={() => setEditingId(id)}
						handleDelete={handleRemoveMessage}
						handleThread={() => {}}
						handleReaction={handleReaction}
					/>
				)}
			</div>
		</>
	);
}
