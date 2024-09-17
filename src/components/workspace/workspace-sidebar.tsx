"use client";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { SidebarItem } from "@/components/workspace/workspace-sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
	AlertTriangle,
	HashIcon,
	Loader,
	MessageSquareText,
	SendHorizonal,
} from "lucide-react";
import { UserItem } from "./workspace-user-item";

export const WorkspaceSidebar = () => {
	const workspaceId = useWorkspaceId();
	const { data: member, isIsLoading: memberLoading } = useCurrentMember({
		workspaceId,
	});
	const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
		id: workspaceId,
	});

	const { data: channels } = useGetChannels({
		workspaceId,
	});

	const { data: members } = useGetMembers({
		workspaceId,
	});

	if (workspaceLoading || memberLoading)
		return (
			<div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
				<Loader className="size-5 animate-spin text-white" />
			</div>
		);

	if (!workspace || !member)
		return (
			<div className="flex flex-col gap-y-2 bg-[#5e2c5f] h-full items-center justify-center">
				<AlertTriangle className="size-5 text-white" />
				<p className="text-white text-sm">Workspace not found</p>
			</div>
		);

	return (
		<div className="flex flex-col gap-y-2 bg-[#5e2c5f] h-full">
			<WorkspaceHeader
				workspace={workspace}
				isAdmin={member.role === "admin"}
			/>
			<div className="flex flex-col px-2 mt-3">
				{/* sidebar items */}
				<SidebarItem
					label="Threads"
					icon={MessageSquareText}
					id="threads"
					// variant="active"
				/>
				<SidebarItem
					label="Drafts and Sent"
					icon={SendHorizonal}
					id="drafts"
					// variant="active"
				/>
			</div>

			<WorkspaceSection label="channels" hint="New channel" onNew={() => {}}>
				{/* channels  */}
				{channels?.map((channelItem) => (
					<SidebarItem
						key={channelItem._id}
						label={channelItem.name}
						icon={HashIcon}
						id={channelItem._id}
					/>
				))}
			</WorkspaceSection>
			<WorkspaceSection
				label="Direct messages"
				hint="New direct message"
				onNew={() => {}}
			>
				{/* members */}
				{members?.map((memberItem) => (
					<UserItem
						key={memberItem._id}
						label={memberItem.user.name}
						image={memberItem.user.image}
						id={memberItem._id}
					/>
				))}
			</WorkspaceSection>
		</div>
	);
};
