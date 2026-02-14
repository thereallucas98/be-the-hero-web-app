export { registerUser } from './auth/register-user.use-case'
export type {
  RegisterUserInput,
  RegisterUserResult,
} from './auth/register-user.use-case'

export { loginUser } from './auth/login-user.use-case'
export type {
  LoginUserInput,
  LoginUserResult,
} from './auth/login-user.use-case'

export { getMe } from './me/get-me.use-case'
export type { GetMeResult } from './me/get-me.use-case'

export { createWorkspace } from './workspaces/create-workspace.use-case'
export type {
  CreateWorkspaceInput,
  CreateWorkspaceResult,
  Principal,
} from './workspaces/create-workspace.use-case'

export { listMyWorkspaces } from './workspaces/list-my-workspaces.use-case'
export type { ListMyWorkspacesResult } from './workspaces/list-my-workspaces.use-case'

export { getWorkspaceById } from './workspaces/get-workspace-by-id.use-case'
export type {
  GetWorkspaceByIdInput,
  GetWorkspaceByIdResult,
  Principal as GetWorkspacePrincipal,
} from './workspaces/get-workspace-by-id.use-case'

export { updateWorkspace } from './workspaces/update-workspace.use-case'
export type {
  UpdateWorkspaceInput,
  UpdateWorkspaceResult,
  Principal as UpdateWorkspacePrincipal,
} from './workspaces/update-workspace.use-case'

export { updateWorkspaceLocation } from './workspaces/update-workspace-location.use-case'
export type {
  UpdateWorkspaceLocationInput,
  UpdateWorkspaceLocationResult,
  Principal as UpdateWorkspaceLocationPrincipal,
} from './workspaces/update-workspace-location.use-case'
