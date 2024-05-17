import express = require('express');
import { UserRouter } from './routers/user-router';
import { AuthRouter } from './routers/auth-router';
import { RenderRouter } from './routers/render-router';
import 'dotenv/config';
import path = require('path');

const app: express.Application = express();

// Configuración necesaria para conectar a la base de datos
const opts = {
    url: process.env.LIBSQL_URL ?? "",
    authToken: process.env.LIBSQL_AUTH_TOKEN ?? "",
}

app.use(express.static(path.resolve('dist/client')));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enrutadores
const authRouter = new AuthRouter(app, opts);
const userRouter = new UserRouter(opts);
const renderRouter = new RenderRouter();

// Asignando rutas a la aplicación
app.use('/users', userRouter.router);
app.use('/auth', authRouter.router);
app.use('/', renderRouter.router);


app.listen(3000, () => {console.log('Server is running on port 3000')})