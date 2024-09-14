"use client";
import { useParams } from "next/navigation";
import type { Id } from "../../convex/_generated/dataModel";

export const useWorkspaceId = () => {
  const params = useParams<{ workspaceId: Id<"workspaces"> }>();
  return params.workspaceId;
};
