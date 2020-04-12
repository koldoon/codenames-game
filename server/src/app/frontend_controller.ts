import { Application } from 'express';
import * as express from 'express';
import * as path from 'path';
import { OnApplicationInit } from '../core/on_application_init';

export class FrontendController implements OnApplicationInit {
    constructor(private app: Application) {}

    init() {
        this.app
            .use(express.static(path.join(__dirname, '../../frontend')))
            .use('/*', function (req, res, next) {
                res.sendFile('index.html', {
                    root: path.join(__dirname, '../../frontend')
                });
            });
    }
}
