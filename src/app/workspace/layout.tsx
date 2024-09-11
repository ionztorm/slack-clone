import { Toolbar } from "@/components/workspace/workspace-toolbar";

type WorkspaceLaoyutProps = {
  children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceLaoyutProps) => {
  return (
    <div className="h-full">
      <Toolbar />
      {children}
    </div>
  );
};

export default WorkspaceLayout;
