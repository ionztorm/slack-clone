type WorkspaceIDPageProps = {
  params: {
    workspaceId: string;
  };
};

const WorkspacePage = ({ params }: WorkspaceIDPageProps) => {
  return <div>ID: {params.workspaceId}</div>;
};

export default WorkspacePage;
