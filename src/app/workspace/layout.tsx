"use client";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { Toolbar } from "@/components/workspace/workspace-toolbar";
import { Sidebar } from "@/components/sidebar";

type WorkspaceLaoyutProps = {
	children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceLaoyutProps) => {
	return (
		<div className="h-full">
			<Toolbar />
			<div className="flex h-[calc(100vh-40px)]">
				<Sidebar />
				<ResizablePanelGroup
					direction="horizontal"
					autoSaveId="sc-workspace-layout"
				>
					<ResizablePanel
						defaultSize={20}
						minSize={11}
						className="bg-[#5e2c5f]"
					>
						<WorkspaceSidebar />
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel minSize={20}>{children}</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
};

export default WorkspaceLayout;
