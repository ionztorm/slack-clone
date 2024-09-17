import { FaCaretDown } from "react-icons/fa";
import { Button } from "../ui/button";
import { Hint } from "../hint";
import { PlusIcon } from "lucide-react";
import { useToggle } from "react-use";
import { cn } from "@/lib/utils";

type WokspaceSectionProps = {
	children: React.ReactNode;
	label: string;
	hint: string;
	onNew?: () => void;
};

export const WorkspaceSection = ({
	children,
	label,
	hint,
	onNew,
}: WokspaceSectionProps) => {
	const [on, toggle] = useToggle(true);
	return (
		<div className="flex flex-col mt-3 px-2">
			<div className="flex items-center px-3.5 group">
				<Button
					className="p-0.5 text-sm text-[#f9edff] shrink-0 size-6"
					variant="transparent"
					onClick={toggle}
				>
					<FaCaretDown
						className={cn("size-4 transition-transform", on && "-rotate-90")}
					/>
				</Button>
				<Button
					variant="transparent"
					size="sm"
					className="group px-1.5 text-sm text-[#f9edff] h-[28px] justify-start overflow-hidden items-center"
				>
					<span className="truncate">{label}</span>
				</Button>
				{onNew && (
					<Hint label={hint} side="top" align="center">
						<Button
							onClick={onNew}
							variant="transparent"
							size="iconSm"
							className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-sm text-[#f9edff] shrink-0 size-6"
						>
							<PlusIcon className="size-5" />
						</Button>
					</Hint>
				)}
			</div>
			{/* channels */}
			{on && children}
		</div>
	);
};
