import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QueryCtx } from "../../convex/_generated/server";
import type { Id } from "../../convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const avatarFallback = (str: string) => str.charAt(0).toUpperCase();

export const replaceSpaceWithHyphen = (text: string) =>
  text.replace(/\s+/g, "-").toLocaleLowerCase();

export const doesInputTextExistIgnoreHTML = (text: string) =>
  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

export const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) =>
  ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

export const populateUser = async (ctx: QueryCtx, userId: Id<"users">) =>
  await ctx.db.get(userId);

export const populateMember = async (ctx: QueryCtx, memberId: Id<"members">) =>
  await ctx.db.get(memberId);

export const populateReactions = async (
  ctx: QueryCtx,
  messageId: Id<"messages">,
) =>
  await ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();

// load all messages that are replies to provided message
export const populateThread = async (
  ctx: QueryCtx,
  messageId: Id<"messages">,
) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId),
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);
  if (!lastMessageMember) {
    return {
      count: messages.length,
      image: undefined,
      timestamp: 0,
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);
  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
  };
};
