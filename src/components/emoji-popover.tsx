import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

type EmojiPopoverProps = {
	children: React.ReactNode;
	hint?: string;
	onEmojiSelect: (emoji: Emoji) => void;
};

export type Emoji = {
	id: string;
	keywords: string[];
	name: string;
	native: string;
	shortcodes: string;
	unified: string;
};

export const EmojiPopover = ({
	children,
	hint = "Emoji",
	onEmojiSelect,
}: EmojiPopoverProps) => {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [tooltipOpen, setTooltipOpen] = useState(false);

	const onSelect = (emoji: Emoji) => {
		onEmojiSelect(emoji);
		setPopoverOpen(false);

		setTimeout(() => setTooltipOpen(false), 500);
	};

	return (
		<TooltipProvider>
			<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
				<Tooltip
					open={tooltipOpen}
					onOpenChange={setTooltipOpen}
					delayDuration={50}
				>
					<PopoverTrigger asChild>
						<TooltipTrigger asChild>{children}</TooltipTrigger>
					</PopoverTrigger>
					<TooltipContent className="bg-black text-white border border-white/5">
						<p className="font-medium text-xs">{hint}</p>
					</TooltipContent>
				</Tooltip>
				<PopoverContent className="p-0 w-full border-none shadow-none">
					<Picker data={data} onEmojiSelect={onSelect} />
				</PopoverContent>
			</Popover>
		</TooltipProvider>
	);
};
