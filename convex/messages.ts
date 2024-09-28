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

export const get = query({
	args: {
		channelId: v.optional(v.id("channels")), // Optional channel ID
		conversationId: v.optional(v.id("conversations")), // Optional conversation ID
		parentMessageId: v.optional(v.id("messages")), // Optional parent message ID
		// NOTE : Convex pagination
		paginationOpts: paginationOptsValidator, // Pagination options validator
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx); // Get authenticated user ID
		if (!userId) throw new Error("Unauthorised"); // Check for authorization

		let _convesationId = args.conversationId; // Initialize conversation ID

		// If no conversation or channel ID, but a parent message ID is provided
		if (!args.conversationId && !args.channelId && args.parentMessageId) {
			const parentMessage = await ctx.db.get(args.parentMessageId); // Fetch parent message

			if (!parentMessage) throw new Error("Parent message not found."); // Check if parent message exists

			_convesationId = parentMessage.conversationId; // Set conversation ID from parent message
		}

		// Query messages with specified filters and pagination
		const results = await ctx.db
			.query("messages")
			.withIndex(
				"by_channel_id_parent_message_id_conversation_id",
				(q) =>
					q
						.eq("channelId", args.channelId) // Filter by channel ID
						.eq("parentMessageId", args.parentMessageId) // Filter by parent message ID
						.eq("conversationId", _convesationId), // Filter by conversation ID
			)
			// NOTE : using convex pagination
			.order("desc") // Order results in descending order
			.paginate(args.paginationOpts); // Apply pagination options

		return {
			...results, // Spread existing results
			page: (
				await Promise.all(
					results.page.map(async (message) => {
						// Map over each message in the results
						const member = await populateMember(ctx, message.memberId); // Populate member details
						const user = member ? await populateUser(ctx, member.userId) : null; // Populate user details

						if (!member || !user) return null; // Return null if member or user not found

						const reactions = await populateReactions(ctx, message._id); // Populate reactions for the message
						const thread = await populateThread(ctx, message._id); // Populate thread details
						const image = message.image
							? await ctx.storage.getUrl(message.image) // Get image URL if it exists
							: undefined;

						// Count reactions and group them by value
						const reactionsWithCounts = reactions.map((reaction) => {
							return {
								...reaction,
								count: reactions.filter((r) => r.value === reaction.value)
									.length, // Count occurrences of each reaction
							};
						});

						// Deduplicate reactions and group member IDs
						const dedupeReactions = reactionsWithCounts.reduce(
							(acc, reaction) => {
								const existingReaction = acc.find(
									(r) => r.value === reaction.value, // Check for existing reaction
								);

								if (existingReaction) {
									existingReaction.memberIds = Array.from(
										new Set([...existingReaction.memberIds, reaction.memberId]), // Add member ID to existing reaction
									);
								} else {
									acc.push({ ...reaction, memberIds: [reaction.memberId] }); // Add new reaction
								}

								return acc; // Return accumulated reactions
							},
							[] as (Doc<"reactions"> & {
								count: number;
								memberIds: Id<"members">[];
							})[],
						);

						// Remove memberId from reactions for the final output
						const reactionsWithoutMemberIdProperty = dedupeReactions.map(
							({ memberId, ...rest }) => rest,
						);

						return {
							...message, // Spread original message properties
							image, // Include image URL
							member, // Include member details
							user, // Include user details
							reactions: reactionsWithoutMemberIdProperty, // Include processed reactions
							threadCount: thread.count, // Include thread count
							threadImage: thread.image, // Include thread image
							threadTimestamp: thread.timestamp, // Include thread timestamp
						};
					}),
				)
			).filter(
				(message): message is NonNullable<typeof message> => message !== null, // Filter out null messages
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
