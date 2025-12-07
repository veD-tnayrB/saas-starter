import { getModules } from "@/actions/modules";
import { getActions } from "@/actions/permissions";

import { ModulesManagementClient } from "./management-client";

interface IModulesManagementProps {
  projectId: string;
}

export async function ModulesManagement({ projectId }: IModulesManagementProps) {
  const { modules } = await getModules(projectId);
  const { actions } = await getActions();

  return (
    <ModulesManagementClient
      initialModules={modules}
      availableActions={actions}
      projectId={projectId}
    />
  );
}





