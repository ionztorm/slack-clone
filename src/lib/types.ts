import type { Doc, Id } from "../../convex/_generated/dataModel";

export type TReactions = Array<
	Omit<Doc<"reactions">, "memberId"> & {
		count: number;
		memberIds: Id<"members">[];
	}
>;
