import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { TReactions } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MdOutlineAddReaction } from "react-icons/md";
import { EmojiPopover } from "./emoji-popover";
import { Hint } from "./hint";

type ReactionsProps = {
  reactions: TReactions;
  onChange: (value: string) => void;
};

export function Reactions({ reactions, onChange }: ReactionsProps) {
  const workspaceId = useWorkspaceId();

  const { data: currentMember } = useCurrentMember({ workspaceId });

  const currentMemberId = currentMember?._id;

  if (reactions.length === 0 || !currentMemberId) return null;

  if (reactions.length)
    return (
      <div className="flex items-center gap-1 mt-1 mb-1">
        {reactions.map((reaction) => (
          <Hint
            key={reaction._id}
            label={`${reaction.count} ${reaction.count === 1 ? "person" : "people"} reacted with ${reaction.value}`}
          >
            <button
              type="button"
              key={reaction._id}
              className={cn(
                "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
                reaction.memberIds.includes(currentMemberId) &&
                  "bg-blue-100/70 border-blue-100 text-white",
              )}
              onClick={() => onChange(reaction.value)}
            >
              {reaction.value}
              <span
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  reaction.memberIds.includes(currentMemberId) &&
                    "text-blue-500",
                )}
              >
                {reaction.count}
              </span>
            </button>
          </Hint>
        ))}
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => onChange(emoji)}
        >
          <button
            type="button"
            className="h-6 px-3 rounded-full bg-slate-200/0 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1"
          >
            <MdOutlineAddReaction className="size-4" />
          </button>
        </EmojiPopover>
      </div>
    );
}
