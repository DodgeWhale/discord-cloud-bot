import nodeCleanup from 'node-cleanup';

import server from 'server/app';
import { shutdown } from 'server/bot';

/**
 * Shutdown sequence
 * Stop running the Express app and close the HTTP server
 */
nodeCleanup(function (exitCode: number|null, signal: string|null) {
    // release resources here before node exits
    (async () => {
        console.info(`Terminating process #${process.pid} exit: ${exitCode}`);

        // Express/HTTP server
		server.close();

		// Discord bot
		shutdown();

		if (signal) {
			// calling process.exit() won't inform parent process of signal
			process.kill(process.pid, signal);

			nodeCleanup.uninstall(); // don't call cleanup handler again
			return false;
		}
		return true;
    })();
}, {
    ctrl_C: '{^C}',
    uncaughtException: 'Uncaught exception occurred:'
});