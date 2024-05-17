import { Client, Row, createClient } from "@libsql/client";
import { UserDB } from "../classes/user";
import { RegisterUser } from "../classes/register-user";
import * as bcrypt from 'bcrypt';
import * as sqlstring from 'sqlstring';

/*
const result = await client.execute({
  sql: "SELECT * FROM users WHERE id = ?",
  args: [1],
});
*/


class UserController {

    private _client: Client;

    constructor(opts: { url: string, authToken: string }) {
        this._client = createClient(opts)
    }

    async getAllUsers(): Promise<UserDB[]> {
        let users: UserDB[] = [];

        try {
            const result = await this._client.execute("SELECT * FROM users");

            result.rows.forEach((row: Row) => {
                users.push(this.userFromRow(row));
            })
            return users;
        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al obtener los usuarios');
        }
    }

    async getUserById(id: number): Promise<UserDB | undefined> {
        let user: UserDB | undefined = undefined;
        try {
            
            const escape = sqlstring.format('SELECT * FROM users WHERE id = ?', [id]);
            const result = await this._client.execute(escape);
            
            if (result.rows.length > 0) {
                user = this.userFromRow(result.rows[0]);
            } 
            return user;

        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al obtener el usuario con id ' + id);
        }
    }

    async getUserByUsername(username: string): Promise<UserDB | undefined> {
        let user: UserDB | undefined = undefined;

        try {
            const escape = sqlstring.format('SELECT * FROM users WHERE user_name = ?', [username]);
            const result = await this._client.execute(escape);

            if (result.rows.length > 0) {
                user = this.userFromRow(result.rows[0]);
            }
            return user;
        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al obtener el usuario con username ' + username);
        }
    }

    // True si el usuario se crea correctamente y false si ya existe un usuario con ese email o username
    async createUser(user: RegisterUser): Promise<boolean> {
        try {
            let escape = sqlstring.format('SELECT * FROM users WHERE email = ? or user_name = ?', [user.email, user.username]);
            
            const search = await this._client.execute(escape);

            // Si ya existe un usuario con ese email o username
            if(search.rows.length > 0)
                return false;
            
            // Si no existe, se encripta la contraseña añadiendole un salt generado en el momento
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(user.password, salt);

            escape = sqlstring.format('INSERT INTO users (email, user_name, password, role_id) VALUES (?, ?, ?, ?);', [user.email, user.username, hashedPassword, user.role]);

            // Se ejecuta la consulta
            await this._client.execute(escape);
            return true;

        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al crear el usuario');
        }
    }

    // TRUE si se ha eliminado, FALSE si no se ha encontrado el usuario
    async deleteUserById(id: number): Promise<boolean> {
        let escape;

        try{
            escape = sqlstring.format('SELECT * FROM users WHERE id = ?', [id]);
            const search = await this._client.execute(escape);

            if(search.rows.length === 0)
                return false;

            escape = sqlstring.format('DELETE FROM users WHERE id = ?', [id]);
            await this._client.execute(escape);
            return true;
        }
        catch(error){
            console.log(error);
            throw new Error('Error en el servidor al eliminar el usuario con id ' + id);
        }
    }

    async updateUserById(id: number, updatedUser: RegisterUser): Promise<boolean> {
        let escape;

        try {
            escape = sqlstring.format('SELECT * FROM users WHERE id = ?', [id]);
            const search = await this._client.execute(escape);

            // Si no se ha encontrado el usuario devuelve false
            if(search.rows.length === 0)
                return false;

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(updatedUser.password, salt);

            escape = sqlstring.format('UPDATE users SET email = ?, user_name = ?, role_id = ?, password = ? WHERE id = ?', [updatedUser.email, updatedUser.username, updatedUser.role, hashedPassword ,id]);

            await this._client.execute(escape);
            return true;

        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al actualizar el usuario con id ' + id);
        }
    }

    async replaceUserById(id: number, newUser: RegisterUser): Promise<boolean> {
        try {
            const deleted = await this.deleteUserById(id);

            // Si no se ha eliminado el usuario significa que no existe un usuario con ese id
            if(!deleted)
                return false;

            return await this.createUser(newUser);

        } catch (error) {
            console.log(error);
            throw new Error('Error en el servidor al reemplazar el usuario con id ' + id);
        }
    }

    public userFromRow(row: Row): UserDB {
        return new UserDB(row.id as number, row.email as string, row.user_name as string, row.password as string, row.role_id as number);
    }


}


export { UserController };