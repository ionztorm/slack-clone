import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isMemberAdmin } from "../src/data/authorisation";

const generateCode = () =>
	Array.from(
		{ length: 6 },
		() =>
			"0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)],
	).join("");

// create workspaces
export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorised");
		const joinCode = generateCode();
		const workspaceId = await ctx.db.insert("workspaces", {
			name: args.name,
			userId,
			joinCode,
		});

		await ctx.db.insert("members", {
			userId,
			workspaceId,
			role: "admin",
		});

		await ctx.db.insert("channels", {
			name: "general",
			workspaceId,
		});

		return workspaceId;
	},
});

// return all workspaces the user is a member of
export const get = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return [];

		const members = await ctx.db
			.query("members")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.collect();

		const workspaceIds = members.map((member) => member.workspaceId);

		const workspaces = [];

		for (const workspaceId of workspaceIds) {
			const workspace = await ctx.db.get(workspaceId);

			if (workspace) workspaces.push(workspace);
		}

		return workspaces;
	},
});

export const getInfoById = query({
	args: { workspaceId: v.id("workspaces") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const member = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("userId", userId),
			)
			.unique();

		const workspace = await ctx.db.get(args.workspaceId);

		return { name: workspace?.name, isMember: !!member };
	},
});

export const getById = query({
	args: { id: v.id("workspaces") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return null;

		const member = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.id).eq("userId", userId),
			)
			.unique();

		if (!member) return null;

		return await ctx.db.get(args.id);
	},
});

export const update = mutation({
	args: {
		id: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error("Unauthorised");

		// check if user is member of current workspace
		const member = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.id).eq("userId", userId),
			)
			.unique();

		// ensure valid membership existr and that member is admin of workspace
		if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

		await ctx.db.patch(args.id, { name: args.name });

		return args.id;
	},
});

export const remove = mutation({
	args: {
		id: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error("Unauthorised");

		// check if user is member of current workspace
		const member = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.id).eq("userId", userId),
			)
			.unique();

		// ensure valid membership existr and that member is admin of workspace
		if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

		// get members associated with workspace
		const [members] = await Promise.all([
			ctx.db
				.query("members")
				.withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
				.collect(),
		]);

		// delete members
		for (const member of members) await ctx.db.delete(member._id);

		// delete workspace
		await ctx.db.delete(args.id);

		return args.id;
	},
});

export const newJoinCode = mutation({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error("Unauthorised");

		const member = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("userId", userId),
			)
			.unique();

		if (!member || !isMemberAdmin(member)) throw new Error("Unauthorised");

		const joinCode = generateCode();

		await ctx.db.patch(args.workspaceId, { joinCode });

		return args.workspaceId;
	},
});

export const join = mutation({
	args: {
		joinCode: v.string(),
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error("Unauthorised");

		const workspace = await ctx.db.get(args.workspaceId);

		if (!workspace)
			throw new Error("Workspace does not exist. It may have been deleted.");

		if (args.joinCode.toLocaleLowerCase() !== workspace.joinCode)
			throw new Error("Invalid join code.");

		const existingMember = await ctx.db
			.query("members")
			.withIndex("by_workspace_id_user_id", (q) =>
				q.eq("workspaceId", args.workspaceId).eq("userId", userId),
			)
			.unique();

		if (existingMember)
			throw new Error("You are already a member of this workspace");

		await ctx.db.insert("members", {
			userId,
			workspaceId: args.workspaceId,
			role: "member",
		});

		return workspace._id;
	},
});
