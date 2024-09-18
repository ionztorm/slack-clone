import type { Doc } from "../../convex/_generated/dataModel";

export const isMemberAdmin = (member: Doc<"members">) =>
	member.role === "admin";
