import { Button } from "@/components/ui/button";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/use-get-member";
import { MailIcon, XIcon } from "lucide-react";
import { Loading } from "@/components/loading";
import { Alert } from "@/components/alert";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type ProfileProps = {
  memberId: Id<"members">;
  onClose: () => void;
};

export function Profile({ memberId, onClose }: ProfileProps) {
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="h-[49px] flex justify-between items-center px-4 border-b">
        <p className="text-lg font-bold">Profile</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      {isLoadingMember && !member && <Loading />}
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
  );
}
