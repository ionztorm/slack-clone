"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function MemberPage() {
	const workspaceId = useWorkspaceId();
	const memberId = useMemberId();

	const [conversationId, setConversationId] =
		useState<Id<"conversations"> | null>(null);

	const { mutate, isPending: conversationIsLoading } =
		useCreateOrGetConversation();

	useEffect(() => {
		mutate(
			{ workspaceId, memberId },
			{
				onSuccess: (data) => {
					console.log(data);
					setConversationId(data);
				},
				onError: () => {
					toast.error("Error loading conversation");
				},
			},
		);
	}, [memberId, mutate, workspaceId]);

	// console.log("workspace id", workspaceId);
	// console.log("member id", memberId);
	// console.log("conversation id: ", conversationId);
	// console.log("data: ", data);

	if (conversationIsLoading)
		return (
			<div className="h-full flex items-center justify-center">
				<Loader className="size-6 animate-spin text-muted-foreground" />
			</div>
		);

	if (!conversationId)
		return (
			<div className="h-full flex items-center justify-center flex-col gap-y-2">
				<AlertTriangle className="size-6 text-muted-foreground" />
				<p className="text-sm text-muted-foreground">Conversation not found</p>
			</div>
		);

	return <div>{conversationId}</div>;
}
