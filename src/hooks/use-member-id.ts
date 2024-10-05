import { useParams } from "next/navigation";
import type { Id } from "../../convex/_generated/dataModel";

export const useMemberId = () => {
	const params = useParams<{ memberId: Id<"members"> }>();
	return params.memberId;
};
