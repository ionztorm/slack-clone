import { Sidebar } from "@/components/workspace/workspace-sidebar";
import { Toolbar } from "@/components/workspace/workspace-toolbar";

type WorkspaceLaoyutProps = {
  children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceLaoyutProps) => {
  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        {children}
      </div>
    </div>
  );
};

export default WorkspaceLayout;
