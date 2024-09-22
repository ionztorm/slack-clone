"use client";

import { ChannelHeader } from "@/components/channel/channel-header";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";

const ChannelPage = () => {
	const channelId = useChannelId();
	const { data: channel, isLoading: channelLoading } = useGetChannel({
		id: channelId,
	});

	if (channelLoading)
		return (
			<div className="h-full flex-1 flex items-center justify-center">
				<Loader className="animate-spin size-6 text-muted-foreground" />
			</div>
		);

	if (!channel)
		return (
			<div className="h-full flex-1 flex flex-col gay-y-2 items-center justify-center">
				<TriangleAlert className="size-6 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">Channel not found</span>
			</div>
		);

	return (
		<div className="flex flex-col h-full">
			<ChannelHeader title={channel.name} />
		</div>
	);
};

export default ChannelPage;
