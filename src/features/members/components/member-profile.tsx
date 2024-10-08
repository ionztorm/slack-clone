import { Button } from "@/components/ui/button";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/use-get-member";
import { ChevronDownIcon, MailIcon, XIcon } from "lucide-react";
import { Loading } from "@/components/loading";
import { Alert } from "@/components/alert";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRemoveMember } from "../api/use-remove-member";
import { useUpdateMember } from "../api/use-update-member";
import { useCurrentMember } from "../api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { isMemberAdmin } from "@/data/authorisation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

type ProfileProps = {
  memberId: Id<"members">;
  onClose: () => void;
};

export function Profile({ memberId, onClose }: ProfileProps) {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this workspace?",
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove user from workspace",
    "Are you sure you want to remove this member from the workspace?",
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Update Roles",
    "Are you sure you want to update this members roles?",
  );

  const { data: currentMember, isLoading: isCurrentMemberLoading } =
    useCurrentMember({ workspaceId });
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("Member removed");
          onClose();
        },
        onError: () => {
          toast.error("Unable to remove member");
        },
      },
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;

    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("You left!");
          router.replace("/");
          onClose();
        },
        onError: () => {
          toast.error("Unable to leave workspace.");
        },
      },
    );
  };

  const onUpdateRole = async (role: Doc<"members">["role"]) => {
    const ok = await confirmUpdate();
    if (!ok) return;

    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success("Member roles updated");
          onClose();
        },
        onError: () => {
          toast.error("Unable to update roles");
        },
      },
    );
  };

  return (
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        {isLoadingMember && isCurrentMemberLoading && !member && <Loading />}
        {!isLoadingMember && !member && <Alert text="Profile not found" />}
        {!isLoadingMember && member && (
          <>
            <div className="flex flex-col items-center justify-center p-4">
              <UserAvatar
                name={member.user.name}
                image={member.user.image}
                size="profile"
              />
            </div>
            <div className="flex flex-col p-4">
              <p className="text-xl font-bold">{member.user.name}</p>

              {currentMember &&
                isMemberAdmin(currentMember) &&
                currentMember._id !== memberId && (
                  <div className="flex items-center gap-2 mt-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full capitalize">
                          {member.role}{" "}
                          <ChevronDownIcon className="size-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuRadioGroup
                          value={member.role}
                          onValueChange={(role) =>
                            onUpdateRole(role as Doc<"members">["role"])
                          }
                        >
                          <DropdownMenuRadioItem value="admin">
                            Admin
                          </DropdownMenuRadioItem>

                          <DropdownMenuRadioItem value="member">
                            Member
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={onRemove}
                      variant="outline"
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                )}

              {currentMember &&
                !isMemberAdmin(currentMember) &&
                currentMember._id === memberId && (
                  <div className="mt-4">
                    <Button
                      onClick={onLeave}
                      variant="outline"
                      className="w-full"
                    >
                      Leave
                    </Button>
                  </div>
                )}
            </div>
            <Separator />
            <div className="flex flex-col p-4">
              <p className="text-sm font-bold mb-4">Contact Information</p>
              <div className="flex items-center gap-2">
                <div className="size-9 flex rounded-md bg-muted items-center justify-center">
                  <MailIcon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[13px] font-semibold text-muted-foreground">
                    Email Address
                  </p>
                  <Link
                    href={`mailto:${member.user.email}`}
                    className="text-sm hover:underline text-[#1263a3]"
                  >
                    {member.user.email}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
