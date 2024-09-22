import { Button } from "../ui/button";
import { FaChevronDown } from "react-icons/fa";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { TrashIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Input } from "../ui/input";
import { replaceSpaceWithHyphen } from "@/lib/utils";
import { useChannelId } from "@/hooks/use-channel-id";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { toast } from "sonner";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { isMemberAdmin } from "@/data/authorisation";

type ChannelHeaderProps = {
	title: string;
};

export const ChannelHeader = ({ title }: ChannelHeaderProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [value, setValue] = useState(title);
	const [ConfirmDialog, confirm] = useConfirm(
		"Delete this channel?",
		"You are about to delete this channel, and all of its messages. This action is irreversable",
	);

	const router = useRouter();

	const channelId = useChannelId();
	const workspaceId = useWorkspaceId();

	const { data: member } = useCurrentMember({ workspaceId });
	const isAdmin = member ? isMemberAdmin(member) : false;

	const { mutate: updateChannel, isPending: isUpdatingChannel } =
		useUpdateChannel();

	const { mutate: removeChannel, isPending: isRemovingChannel } =
		useRemoveChannel();

	const handleEditOpen = (value: boolean) => {
		if (!isAdmin) return;
		setEditOpen(value);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = replaceSpaceWithHyphen(e.target.value);
		setValue(value);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		updateChannel(
			{ name: value, id: channelId },
			{
				onSuccess: () => {
					toast.success("Channel updated");
					setEditOpen(false);
				},
				onError: () => {
					toast.error("Failed to update channel");
				},
			},
		);
	};

	const handleDelete = async () => {
		const ok = await confirm();

		if (!ok) return;

		removeChannel(
			{ id: channelId },
			{
				onSuccess: () => {
					toast.success("Channel deleted");
					setEditOpen(false);
					router.replace(`/workspace/${workspaceId}`);
				},
				onError: () => {
					toast.error("Unable to remove channel");
				},
			},
		);
	};

	if (!isAdmin)
		return (
			<div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
				<span className="truncate text-lg font-semibold px-2 overflow-hidden w-auto">
					# {title}
				</span>
			</div>
		);

	return (
		<div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
			<ConfirmDialog />
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						className="text-lg font-semibold px-2 overflow-hidden w-auto"
						size="sm"
					>
						<span className="truncate"># {title}</span>
						<FaChevronDown className="size-2.5 ml-2" />
					</Button>
				</DialogTrigger>
				<DialogContent className="p-0 bg-gray-50 overflow-hidden">
					<DialogHeader className="p-4 border-b bg-white">
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<div className="px-4 pb-4 flex flex-col gap-y-2">
						<Dialog open={editOpen} onOpenChange={handleEditOpen}>
							<DialogTrigger asChild>
								<div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
									<div className="flex items-center justify-between">
										<p className=" text-sm font-semibold">Channel name</p>
										{isAdmin && (
											<p className="text-sm text-[#1264a3] hover:underline font-semibold">
												Edit
											</p>
										)}
									</div>
									<p className="text-sm"># {title}</p>
								</div>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Rename this channel</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleSubmit} className="space-y-4">
									<Input
										value={value}
										disabled={isUpdatingChannel}
										onChange={handleChange}
										required
										autoFocus
										minLength={3}
										maxLength={80}
										placeholder="e.g. plan-budget"
									/>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="outline" disabled={false}>
												Cancel
											</Button>
										</DialogClose>
										<Button disabled={false}>Save</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
						{isAdmin && (
							<button
								type="button"
								onClick={handleDelete}
								disabled={isRemovingChannel}
								className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
							>
								<TrashIcon className="size-4" />
								<p className="text-sm font-semibold">Delete channel</p>
							</button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
