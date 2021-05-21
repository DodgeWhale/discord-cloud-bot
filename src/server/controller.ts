import { Request, Response, NextFunction } from 'express';

export function render(res: Response, view: string, data: object = {}, status = 200): void {
    // res.type('html'); // => 'text/html'

    res.status(status).render(view, data, (err: Error, html: string) => {
        if (err) {
            console.warn(err);
            return;
        }
        console.info(`Rendered ${view}`);
        res.send(html);
    });
}

export function sendFile(res: Response, fileName: string): void {
    res.sendFile(fileName, this.options);
}

export function success(res: Response, body?: any, status = 200): Response<any> {
    return res.status(status).send(body);
}

export function serverError(res: Response, metadata: any, status = 500): void {
    res.status(status).send({
		error: metadata
	});
    return;
}

export function badRequest(res: Response, metadata: any, status = 400): Response<any> {
    return res.status(status).send({
		error: metadata
	});
}

export function redirect(res: Response, path: string, query?: string) {
    let url = path;
    if (query) url += ('?' + query);

    res.redirect(url);
    return;
}

export function json(res: Response, object: object, status = 200): Response<any> {
    return res.status(status).json(object);
}