import { Role } from "../classes/role";

export interface UserDTO {
    id: number;
    email: string;
    username: string;
    role: Role;
}