import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(
	async (ctx) => await ctx.storage.generateUploadUrl(),
);
