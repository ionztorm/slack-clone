import { v } from "convex/values";
import { getMember } from "../src/lib/utils";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggle = mutation({
	args: {
		messageId: v.id("messages"),
		value: v.string(),
	},
	handler: async (ctx, args) => {
		const { value, messageId } = args;

		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorised");

		const message = await ctx.db.get(messageId);
		if (!message) throw new Error("Message not found");

		const { workspaceId } = message;

		const member = await getMember(ctx, workspaceId, userId);
		if (!member) throw new Error("Unauthorised");

		const { _id: memberId } = member;
		// check if this user has already reacted to this message
		const existingMessageReactionFromUser = await ctx.db
			.query("reactions")
			.filter((q) =>
				q.and(
					q.eq(q.field("messageId"), messageId),
					q.eq(q.field("memberId"), member._id),
					q.eq(q.field("value"), value),
				),
			)
			.first();

		if (existingMessageReactionFromUser) {
			await ctx.db.delete(existingMessageReactionFromUser._id);
			return existingMessageReactionFromUser._id;
		}

		if (!existingMessageReactionFromUser) {
			const newReactionId = await ctx.db.insert("reactions", {
				value,
				memberId,
				messageId,
				workspaceId,
			});
			return newReactionId;
		}
	},
});
