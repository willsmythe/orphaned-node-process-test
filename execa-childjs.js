const execa = require('execa');
const which = require('which');

(async () => {
    console.log(`pid      : ${process.pid}`);
    console.log(`node     : ${which.sync('node')}`);

    const childProc = execa('child.js', {
        reject: false
    });

    console.log(`child pid: ${childProc.pid} ${JSON.stringify(childProc.spawnargs)}`);

    // Pipe stdout from the child process
    childProc.stdout.pipe(process.stdout);

    // Kill the child process after 3 seconds
    await new Promise((resolve) =>  {
        setTimeout(() => { 
            console.log(`Killing child process...`);        
            childProc.kill();
            resolve();
        }, 3000);
    });

    console.log(`Process ending; child process; ${JSON.stringify(childProc.killed)}`);
})();