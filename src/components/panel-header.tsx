import { XIcon } from "lucide-react";
import { Button } from "./ui/button";

type PanelHeaderProps = {
  title: string;
  onClose: () => void;
};
export function PanelHeader({ title, onClose }: PanelHeaderProps) {
  return (
    <div className="h-[49px] flex justify-between items-center px-4 border-b">
      <p className="text-lg font-bold">{title}</p>
      <Button onClick={onClose} size="iconSm" variant="ghost">
        <XIcon className="size-5 stroke-[1.5]" />
      </Button>
    </div>
  );
}
