# orphaned-node-process-test

See https://github.com/facebook/jest/issues/7760 for more background.

## Examples

### `spawn-cmd.js`

This demonstrates the problem independent of Yarn, and happens with both execa and cross-spawn. 

spawn-cmd.js calls Node's `child_process` to spawn `runchild.cmd`, which is a batch file that runs `node child.js`.

Regardless of how spawn-cmd.js is run, 3 processes are involved:

1. A `node.exe` process running `spawn-cmd.js`
2. A `cmd.exe` process representing `runchild.cmd`
3. A `node.exe` process running `child.js`

#### Running

``` 
node spawn-cmd.js
```
```
npm run spawn-cmd
```
```
yarn run spawn-cmd
```

Regardless of how spawn-cmd is run, the node.exe process for child.js (#3) is always orphaned because the call to `kill()` only kills the cmd.exe process (#2).

### `execa-child.js`

`execa-childjs.js` uses `execa` to spawn `child.js`. execa uses cross-spawn, which reads the shebang in child.js and uses "which" to find the "node" to run ...

When "node" is an .exe, it gets spawned directly and there are 2 processes involved:

1. The `node.exe` process running `execa-child.js`
2. The `node.exe` process running `child.js`

When "node" is a .cmd, it gets spawned via cmd.exe and there are 3 processes involved:

1. The `node.exe` process running `execa-child.js`
2. The `cmd.exe` process representing `node.cmd`
3. The `node.exe` process running `child.js`

#### Running

Just node (WORKS)
```
node execa-childjs.js
```

NPM (WORKS)
```
npm run execa-childjs
```

Yarn 1.9.4 (WORKS)
```
yarn run execa-childjs
```

Yarn 1.13.0 (**FAILS**)
```
yarn run execa-childjs
```

Example output showing how the child process (#3) keeps running, even though its parent (#2) has been killed by its parent (#1):

```
pid      : 19420
node     : C:\Users\foo\AppData\Local\Temp\yarn--1549651553323-0.6252854268642696\node.CMD
child pid: 8956 ["C:\\WINDOWS\\system32\\cmd.exe","/q","/d","/s","/c","\"node ^\"C:\\work\\foo\\orphaned-node-process-test\\child.js^\"\""]
child.js pid: 17212; ppid: 8956; 0
child.js pid: 17212; ppid: 8956; 1
Killing child process...
Process ending; child process; true
child.js pid: 17212; ppid: 8956; 2
child.js pid: 17212; ppid: 8956; 3
child.js pid: 17212; ppid: 8956; 4
child.js pid: 17212; ppid: 8956; 5
```

In the non-working (Yarn 1.13.0) case, Yarn has generated a `node.cmd` and placed it in a directory which it has injected at the front of $PATH. This causes cross-spawn to launch cmd.exe. Calling `kill()` on this child process only kills the cmd.exe process, but its child process (node.exe) continues to run.
