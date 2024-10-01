import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import {
  getMember,
  populateMember,
  populateReactions,
  populateThread,
  populateUser,
} from "../src/lib/utils";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { isMemberAdmin } from "../src/data/authorisation";

export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

    await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

    await ctx.db.delete(args.id);

    return args.id;
  },
});
export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    let _convesationId = args.conversationId;

    // Resolve conversation ID from parent message if needed
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new Error("Parent message not found.");
      _convesationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _convesationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;
            if (!member || !user) return null;

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThread(ctx, message._id);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            // Count and deduplicate reactions
            const reactionsWithCounts = reactions.map((reaction) => ({
              ...reaction,
              count: reactions.filter((r) => r.value === reaction.value).length,
            }));

            const dedupeReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value,
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId]),
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[],
            );

            const reactionsWithoutMemberIdProperty = dedupeReactions.map(
              ({ memberId, ...rest }) => rest,
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadTimestamp: thread.timestamp,
            };
          }),
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message !== null,
      ),
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) throw new Error("Unauthorised");

    let _convesationId = args.conversationId;

    // reply in 1-1 DM
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new Error("Parent message not found");
      _convesationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      conversationId: _convesationId,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
    });

    return messageId;
  },
});
