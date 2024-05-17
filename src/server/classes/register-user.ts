import { RegisterDTO } from '../dto/register-dto';
import { Role } from './role';

class RegisterUser {
    constructor(
        private _email: string = '',
        private _username: string = '',
        private _password: string = '',
        private _role: Role = Role.USER
    ) {}

    public fromDto(registerDTO: RegisterDTO) {
        this._email = registerDTO.email;
        this._username = registerDTO.username;
        this._password = registerDTO.password;
        this._role = registerDTO.role;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get role(): Role {
        return this._role;
    }

    set role(value: Role) {
        this._role = value;
    }
}

export { RegisterUser };

