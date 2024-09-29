import { format, isToday, isYesterday } from "date-fns";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { avatarFallback } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { Thumbnail } from "./thumbnail";
//import Renderer from "./message-renderer";

const Renderer = dynamic(() => import("@/components/message-renderer"), {
  ssr: false,
});

type MessageProps = {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorName?: string;
  authorImage?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  updatedAt: Doc<"messages">["updatedAt"];
  createdAt: Doc<"messages">["_creationTime"];
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  isEditing: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  isCompact: boolean;
  hideThreadButton?: boolean;
};

const formatFullTime = (date: Date) =>
  `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;

export function Message({
  id,
  memberId,
  authorName = "Member",
  authorImage,
  isAuthor,
  reactions,
  body,
  image,
  updatedAt,
  createdAt,
  threadTimestamp,
  threadImage,
  threadCount,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
}: MessageProps) {
  if (isCompact)
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button
              className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-10 leading-[22px] text-center hover:underline min-w-10"
              type="button"
            >
              {format(new Date(createdAt), "hh:mm")}
            </button>
          </Hint>

          <div className="flex flex-col w-full">
            <Renderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
      <div className="flex items-start gap-2">
        <button type="button">
          <UserAvatar name={authorName} image={authorImage} size="lg" />
        </button>
        <div className="flex flex-col w-full overflow-hidden">
          <div className="text-sm">
            <button
              onClick={() => {}}
              type="button"
              className="font-bold text-primary hover:underline"
            >
              {authorName}
            </button>
            <span>&nbsp;&nbsp;</span>
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
              >
                {format(new Date(createdAt), "h:mm a")}
              </button>
            </Hint>
          </div>
          <Renderer value={body} />
          <Thumbnail url={image} />
          {updatedAt ? (
            <span className="text-xs text-muted-foreground">(edited)</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
