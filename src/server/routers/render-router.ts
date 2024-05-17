import express = require('express');
import path = require('path');

class RenderRouter {
    private _router: express.Router;

    constructor() {
        this._router = express.Router();

        //GET INSIDE PAGE
        this._router.get('/', (request: express.Request, response: express.Response) => {
            if(request.isAuthenticated()){
                response.sendFile(path.resolve('dist/client/templates/index-logged.html'));
            }
            else{
                response.sendFile(path.resolve('dist/client/templates/index.html'));
            }
        });

        //GET LOGIN PAGE
        this._router.get('/login', (request: express.Request, response: express.Response) => {
            response.sendFile(path.resolve('dist/client/templates/login.html'));
        });

        //GET REGISTER PAGE
        this._router.get('/register', (request: express.Request, response: express.Response) => {
            response.sendFile(path.resolve('dist/client/templates/register.html'));
        });
    }

    get router() {
        return this._router;
    }

}

export { RenderRouter };