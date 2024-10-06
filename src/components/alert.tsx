import { AlertTriangle } from "lucide-react";

type AlertProps = {
	text: string;
};

export function Alert({ text }: AlertProps) {
	return (
		<div className="h-full flex items-center justify-center flex-col gap-y-2">
			<AlertTriangle className="size-6 text-muted-foreground" />
			{!!text && <p className="text-sm text-muted-foreground">{text}</p>}
		</div>
	);
}
