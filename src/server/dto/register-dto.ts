import { Role } from "../classes/role";

export interface RegisterDTO {
    email: string;
    username: string;
    role: Role;
    password: string;
}