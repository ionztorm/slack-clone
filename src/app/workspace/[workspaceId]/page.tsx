"use client";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
//type WorkspaceIDPageProps = {
//params: {
//workspaceId: string;
//};
//};

import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkspacePage = () => {
  const workspaceId = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });
  return <div>Workspace Page</div>;
};

export default WorkspacePage;
