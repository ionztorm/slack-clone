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
