import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QueryCtx } from "../../convex/_generated/server";
import type { Id } from "../../convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const replaceSpaceWithHyphen = (text: string) =>
  text.replace(/\s+/g, "-").toLocaleLowerCase();

export const doesInputTextExistIgnoreHTML = (text: string) =>
  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

export const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) =>
  ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
