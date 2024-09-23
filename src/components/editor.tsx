import Quill, { type QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { ImageIcon, Smile } from "lucide-react";
import { Hint } from "./hint";

type EditorProps = {
	variant?: "create" | "update";
};

const Editor = ({ variant = "create" }: EditorProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef || !containerRef.current) return;
		const container = containerRef.current;
		const editorContainer = container.appendChild(
			container?.ownerDocument.createElement("div"),
		);
		const options: QuillOptions = {
			theme: "snow",
		};

		const quill = new Quill(editorContainer, options);

		return () => {
			if (container) container.innerHTML = "";
		};
	}, []);

	return (
		<div className="flex flex-col">
			<div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
				<div ref={containerRef} className="w-full ql-custom" />
				<div className="flex px-2 pb-2 z-[5]">
					<Hint label="Hide formatting">
						<Button
							className=""
							size="iconSm"
							disabled={false}
							variant="ghost"
							onClick={() => {}}
						>
							<PiTextAa className="size-4" />
						</Button>
					</Hint>
					<Hint label="Insert emoji">
						<Button
							className=""
							size="iconSm"
							disabled={false}
							variant="ghost"
							onClick={() => {}}
						>
							<Smile className="size-4" />
						</Button>
					</Hint>
					{variant === "create" && (
						<Hint label="Insert image">
							<Button
								className=""
								size="iconSm"
								disabled={false}
								variant="ghost"
								onClick={() => {}}
							>
								<ImageIcon className="size-4" />
							</Button>
						</Hint>
					)}
					{variant === "update" && (
						<div className="ml-auto flex items-center gap-x-2">
							<Button
								className=""
								variant="outline"
								size="sm"
								onClick={() => {}}
								disabled={false}
							>
								Cancel
							</Button>
							<Button
								className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
								variant="outline"
								size="sm"
								onClick={() => {}}
								disabled={false}
							>
								Save
							</Button>
						</div>
					)}
					{variant === "create" && (
						<Hint label="Submit">
							<Button
								className="ml-auto bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
								size="iconSm"
								disabled={false}
								onClick={() => {}}
							>
								<MdSend className="size-4" />
							</Button>
						</Hint>
					)}
				</div>
			</div>
			<div className="p-2 text-[10px] text-muted-foreground flex justify-end">
				<p>
					<strong>Shift + Return</strong> to add a new line
				</p>
			</div>
		</div>
	);
};

export default Editor;
