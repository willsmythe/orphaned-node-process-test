#!/usr/bin/env node

let index = 0;

// Loop and show process details
setInterval(() => { 
    console.log(`child.js pid: ${process.pid}; ppid: ${process.ppid}; ${index++}`); 
}, 1000);
