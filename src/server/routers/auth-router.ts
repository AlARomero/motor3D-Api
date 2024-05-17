import express = require('express');
import passport from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';
import * as bcrypt from 'bcrypt';
import { UserController } from '../controllers/user-controller';
import { RegisterDTO } from '../dto/register-dto';
import { RegisterUser } from '../classes/register-user';
import {Role} from '../classes/role';
import { UserDB } from '../classes/user';

class AuthRouter {
    private _router: express.Router;
    private _userController: UserController;

    constructor(app: express.Application, opts: { url: string, authToken: string }) {
        this._router = express.Router();
        this._userController = new UserController(opts);

        //PASSPORT
        app.use(session({
            secret: process.env.SECRET ?? '',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
            }
            })
        );
    
        app.use(passport.initialize());
        app.use(passport.session());

        /*
         *  Passport Strategy (username + password + callback)
         *  Se llama a traves del post /auth/login
         *  @param username - input llamado username en el formulario
         *  @param password - input llamado password en el formulario
        */
        const self = this;
        passport.use(new Strategy(function verify(username, password, cb) {
            // Buscar usuario en la base de datos
            self._userController.getUserByUsername(username).then((user) => {
                if(user){
                    // Hay usuario
                    const hashedPassword = user.password;
                    const result = bcrypt.compareSync(password, hashedPassword);
                    if(result){
                        // Contraseña correcta
                        cb(null, user);
                    }
                    else{
                        // Contraseña incorrecta
                        cb(null, false);
                    }
                }
                else{
                    // No existe este usuario
                    cb(null, false);
                }
            }).catch((error) => {
                console.log("Error en la autenticación");
                cb(error);
            });
        }));
        
        passport.serializeUser((user, cb) => {cb(null, user)});
        passport.deserializeUser((user: Express.User, cb) => {cb(null, user)});

        
        //Definicion del ROUTER

        //POST - /auth/login
        this._router.post('/login', function(req, res, next) {
            passport.authenticate('local', function(err: Error, user: UserDB, info: { message: string }) {
                if (err) { 
                    return next(err); 
                }
                if (!user) { 
                    return res.status(401).json({ message: 'Authentication failed' }); 
                }
                req.logIn(user, function(err) {
                    if (err) { 
                        return next(err); 
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
        });

        //POST - /auth/register
        this._router.post('/register', (request: express.Request, response: express.Response) => {
            //Se obtienen los datos del cuerpo y se crea un DTO
            const registerDTO: RegisterDTO = {
                email: request.body.email,
                username: request.body.username,
                role: Role.USER,
                password: request.body.password
            }

            //Se transforma en el objeto de usuario registrado
            const registerUser = new RegisterUser();
            registerUser.fromDto(registerDTO);

            //Se crea el usuario
            this._userController.createUser(registerUser)
                .then((created: boolean) => {
                    if(created) {
                        this._userController.getUserByUsername(registerUser.username).then((user) => {
                            if(!user)
                                response.status(404).json({ message: 'User not found' });
                            request.login(user as UserDB, (error) => {
                                if(error){
                                    response.status(500).json({ message: 'Internal server error' });
                                    console.log(error);
                                }
                                else
                                    response.redirect('/');
                            });
                        });

                    }
                    else{
                        response.status(400).json({ message: 'User already exists' });
                    }
                })
                .catch((error: any) => {
                    console.log(error);
                    response.status(500).json({ message: 'Internal server error' });
                });   
        });

        //GET - /auth/logout
        this._router.get('/logout', (request: express.Request, response: express.Response) => {
            request.logout((err) => {
                if (err) {
                    console.log(err);
                    response.status(500).json({ message: 'Error loggin out' });
                }
                console.log('User logged out');
                response.status(200).redirect('/');
            });
        });
    }

    get router() {
        return this._router;
    }

}

export { AuthRouter };