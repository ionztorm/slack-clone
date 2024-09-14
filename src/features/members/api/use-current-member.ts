import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type UseCurrentMemberProps = {
  workspaceId: Id<"workspaces">;
};

export const useCurrentMember = ({ workspaceId }: UseCurrentMemberProps) => {
  const data = useQuery(api.members.current, { workspaceId });
  const isIsLoading = data === undefined;
  return { data, isIsLoading };
};
