import express = require('express');
import { UserController } from "../controllers/user-controller";
import { UserDB } from "../classes/user";
import { UserDTO } from "../dto/user-dto";
import { RegisterDTO } from '../dto/register-dto';
import { RegisterUser } from '../classes/register-user';
import { Role } from '../classes/role';

class UserRouter {

    private _router: express.Router;
    private _userController: UserController;

    constructor(opts: { url: string, authToken: string }) {
        this._router = express.Router();

        this._userController = new UserController(opts);

        //Definicion del router

        //GET /users
        this._router.get('/', (request: express.Request, response: express.Response) => {
            if(!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });

            else {
                const user = request.user as UserDB;
                if (user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {
                    this._userController.getAllUsers()
                        .then((users: UserDB[]) => {
                            let userDTOs: UserDTO[] = []; 
                            users.map((user: UserDB) => userDTOs.push(user.toDto()));
                            response.status(200).json(userDTOs);
                        })
                        .catch((error: any) => {
                            console.log(error);
                            response.status(500).json({ message: 'Internal server error' });
                        });
                }
            }
        });

        //GET /users/:id
        this._router.get('/:id', (request: express.Request, response: express.Response) => {

            if(!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });

            else {
                const id = parseInt(request.params.id);
                const user = request.user as UserDB;

                if (user.role !== Role.ADMIN && id !== user.id || user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {
                    this._userController.getUserById(id)
                        .then((user: UserDB | undefined) => {
                            if(user){
                                response.status(200).json(user.toDto());
                            }
                            else {
                                response.status(404).json({ message: 'User not found' });
                            }
                        })
                        .catch((error: any) => {
                            console.log(error);
                            response.status(500).json({ message: 'Internal server error' });
                        });
                }
            }
        });

        //GET /users/email/:email
        this._router.get('/name/:username', (request: express.Request, response: express.Response) => {
            if(!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });

            else {
                const user = request.user as UserDB;
                const username = request.params.username;

                if (user.role !== Role.ADMIN && username !== user.email || user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {
                    this._userController.getUserByUsername(username)
                        .then((user: UserDB | undefined) => {
                            if(user){
                                response.status(200).json(user.toDto());
                            }
                            else {
                                response.status(404).json({ message: 'User not found' });
                            }
                        })
                        .catch((error: any) => {
                            console.log(error);
                            response.status(500).json({ message: 'Internal server error' });
                        });
                }
            }
        });

        //POST /users
        this._router.post('/', (request: express.Request, response: express.Response) => {

            if(!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });

            else {
                const user = request.user as UserDB;
                if (user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {

                    //Se obtienen los datos del cuerpo y se crea un DTO
                    const registerDTO: RegisterDTO = {
                        email: request.body.email,
                        username: request.body.username,
                        role: request.body.role,
                        password: request.body.password
                    }

                    //Se transforma en el objeto de usuario registrado
                    const registerUser = new RegisterUser();
                    registerUser.fromDto(registerDTO);

                    //Se crea el usuario
                    this._userController.createUser(registerUser)
                        .then((created: boolean) => {
                            if(created) {
                                response.status(201).json({ message: 'User created'});
                            }
                            else{
                                response.status(400).json({ message: 'User already exists' });
                            }
                        })
                        .catch((error: any) => {
                            console.log(error);
                            response.status(500).json({ message: 'Internal server error' });
                        });  
                }
            }   
        });

        //PUT /users/:id
        this._router.put('/:id', (request: express.Request, response: express.Response) => {
            if (!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });
            else {
                const id = parseInt(request.params.id);
                const user = request.user as UserDB;

                if(user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {
                    const registerDTO: RegisterDTO = {
                        email: request.body.email,
                        username: request.body.username,
                        role: request.body.role,
                        password: request.body.password
                    }
                    const registerUser = new RegisterUser();
                    registerUser.fromDto(registerDTO);

                    this._userController.replaceUserById(id, registerUser)
                    .then((result: boolean) => {
                        if(result) {
                            response.status(200).json({ message: 'User replaced' });
                        }
                        else{
                            response.status(404).json({ message: 'User not found' });
                        }
                    })
                    .catch((error: any) => {
                        console.log(error);
                        response.status(500).json({ message: 'Internal server error' });
                    });
                }
            }
        });

        //DELETE /users/:id
        this._router.delete('/:id', (request: express.Request, response: express.Response) => {
            
            if(!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });
            else{

                const id = parseInt(request.params.id);
                const user = request.user as UserDB;

                if(user.role !== Role.ADMIN && id !== user.id || user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });
                else{
                    this._userController.deleteUserById(id)
                    .then((result: boolean) => {
                        if(result) {
                            response.status(200).json({ message: 'User deleted' });
                        }
                        else{
                            response.status(404).json({ message: 'User not found' });
                        }
                    })
                    .catch((error: any) => {
                        console.log(error);
                        response.status(500).json({ message: 'Internal server error' });
                    });
                }
            }
        });

        //PATCH /users/:id
        this._router.patch('/:id', (request: express.Request, response: express.Response) => {
            if (!request.isAuthenticated())
                response.status(401).json({ message: 'Unauthorized' });

            else {
                const id = parseInt(request.params.id);

                const user = request.user as UserDB;
                if(user.role !== Role.ADMIN && id !== user.id  || user.role !== Role.ADMIN)
                    response.status(401).json({ message: 'Unauthorized' });

                else {

                    const registerDTO: RegisterDTO = {
                        email: request.body.email,
                        username: request.body.username,
                        role: request.body.role,
                        password: request.body.password
                    }
                    const registerUser = new RegisterUser();
                    registerUser.fromDto(registerDTO);

                    this._userController.updateUserById(id, registerUser)
                        .then((result: boolean) => {
                            if(result) {
                                response.status(200).json({ message: 'User updated' });
                            }
                            else{
                                response.status(404).json({ message: 'User not found' });
                            }
                        })
                        .catch((error: any) => {
                            console.log(error);
                            response.status(500).json({ message: 'Internal server error' });
                        });
                }
            }
        });
    }

    get router() {
        return this._router;
    }

}

export { UserRouter };