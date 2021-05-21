import { Request, Response } from 'express';

import { success } from 'server/controller';

export function getBase(req: Request, res: Response): void {
	success(res);
}