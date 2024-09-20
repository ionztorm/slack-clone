import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type useGetWorkspaceInfoProps = {
	workspaceId: Id<"workspaces">;
};

export const useGetWorkspaceInfo = ({
	workspaceId,
}: useGetWorkspaceInfoProps) => {
	const data = useQuery(api.workspaces.getInfoById, { workspaceId });
	const isLoading = data === undefined;
	return { data, isLoading };
};
