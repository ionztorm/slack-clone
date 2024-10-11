import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { replaceSpaceWithHyphen } from "@/../../src/lib/utils";
import { isMemberAdmin } from "@/../../src/data/authorisation";

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!members) return [];

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .collect();

    return channels;
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error("Unauhorised");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

    const parsedName = replaceSpaceWithHyphen(args.name);

    const channelId = ctx.db.insert("channels", {
      name: parsedName,
      workspaceId: args.workspaceId,
    });

    return channelId;
  },
});

export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    const channel = await ctx.db.get(args.id);

    if (!channel) throw new Error("Channel not found");

    const { workspaceId } = channel;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

    await ctx.db.patch(args.id, {
      name: args.name,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorised");

    const channel = await ctx.db.get(args.id);

    if (!channel) throw new Error("Channel not found");

    const { workspaceId } = channel;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

    const [messages] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
        .collect(),
    ]);

    for (const message of messages) await ctx.db.delete(message._id);

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const getById = query({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const channel = await ctx.db.get(args.id);

    if (!channel) return null;

    const workspaceId = channel.workspaceId;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) return null;

    return channel;
  },
});
