"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  // get first workspace id
  const workspaceId = useMemo(() => data?.at(0)?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId)
      router.replace(`/workspace/${workspaceId}`); // no workspace found so redirect to create form
    else if (!open) setOpen(true);
  }, [isLoading, workspaceId, setOpen, open, router]);

  return (
    <div>
      <UserButton />
    </div>
  );
}
