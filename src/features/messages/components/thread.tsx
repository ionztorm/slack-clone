import { Message } from "@/components/message-component";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGenrateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { differenceInMinutes, format } from "date-fns";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import type Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useCreateMessage } from "../api/use-create-message";
import { useGetMessage } from "../api/use-get-message";
import { useGetMessages } from "../api/use-get-messages";
import { formatDateLabel } from "@/lib/utils";
import { MESSAGE_GROUPING_TIME_THRESHOLD } from "@/lib/constants";
import { LoadingMoreMessages } from "@/components/messages/loading-more";
import { MessagePaginationObserver } from "@/components/messages/message-pagination-observer";
import { PanelHeader } from "@/components/panel-header";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

type ThreadProps = {
  messageId: Id<"messages">;
  onClose: () => void;
};

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

export function Thread({ messageId, onClose }: ThreadProps) {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { mutate: generateUploadUrl } = useGenrateUploadUrl();
  const { mutate: createMessage } = useCreateMessage();

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: isLoadingMessage } = useGetMessage({
    id: messageId,
  });
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>,
  );

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) throw new Error("URL not found");

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload image");

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });
      // hack : force rebuild uncontrolled Editor component
      setEditorKey((cur) => cur + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PanelHeader title="Thread" onClose={onClose} />

      {(isLoadingMessage || status === "LoadingFirstPage") && (
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!message && (
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Message not found. It may have been deleted.
          </p>
        </div>
      )}

      {message && (
        <>
          <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            {Object.entries(groupedMessages || {}).map(
              ([dateKey, messages]) => (
                <div key={dateKey}>
                  <div className="text-center my-2 relative">
                    <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                    <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300">
                      {formatDateLabel(dateKey)}
                    </span>
                  </div>
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isCompact =
                      prevMessage &&
                      prevMessage.user?._id === message.user?._id &&
                      differenceInMinutes(
                        new Date(message._creationTime),
                        new Date(prevMessage._creationTime),
                      ) < MESSAGE_GROUPING_TIME_THRESHOLD;
                    return (
                      <Message
                        key={message._id}
                        id={message._id}
                        memberId={message.memberId}
                        authorName={message.user.name}
                        authorImage={message.user.image}
                        isAuthor={message.memberId === currentMember?._id}
                        reactions={message.reactions}
                        body={message.body}
                        image={message.image}
                        updatedAt={message.updatedAt}
                        createdAt={message._creationTime}
                        threadCount={message.threadCount}
                        threadImage={message.threadImage}
                        threadName={message.threadName}
                        threadTimestamp={message.threadTimestamp}
                        isEditing={editingId === message._id}
                        setEditingId={setEditingId}
                        isCompact={isCompact}
                        hideThreadButton
                      />
                    );
                  })}
                </div>
              ),
            )}

            <MessagePaginationObserver
              canLoadMore={canLoadMore}
              loadMore={loadMore}
            />

            {isLoadingMore && <LoadingMoreMessages />}

            <Message
              hideThreadButton
              memberId={message.memberId}
              authorImage={message.user.image}
              authorName={message.user.name}
              isAuthor={message.memberId === currentMember?._id}
              body={message.body}
              image={message.image}
              createdAt={message._creationTime}
              updatedAt={message.updatedAt}
              id={message._id}
              reactions={message.reactions}
              isEditing={editingId === message._id}
              setEditingId={setEditingId}
            />
          </div>
          <div className="px-4">
            <Editor
              key={editorKey}
              innerRef={editorRef}
              onSubmit={handleSubmit}
              disabled={isPending}
              placeholder="Reply"
            />
          </div>
        </>
      )}
    </div>
  );
}
