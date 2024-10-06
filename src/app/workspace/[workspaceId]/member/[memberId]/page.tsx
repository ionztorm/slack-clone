"use client";

import { Alert } from "@/components/alert";
import { Conversation } from "@/components/conversations/conversation";
import { Loading } from "@/components/loading";
import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
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

	if (conversationIsLoading) return <Loading />;

	if (!conversationId) return <Alert text="Conversation not found" />;

	return <Conversation id={conversationId} />;
}
