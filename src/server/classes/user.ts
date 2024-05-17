import { Role } from './role';
import { UserDTO } from '../dto/user-dto';

class UserDB {
    constructor(
        private _id: number,
        private _email: string,
        private _username: string,
        private _password: string, 
        private _role: Role = Role.USER
    ) {}

    toDto(): UserDTO {
        const userDto: UserDTO = {
            id: this._id,
            email: this._email,
            username: this._username,
            role: this._role
        };

        return userDto;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
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

export { UserDB };