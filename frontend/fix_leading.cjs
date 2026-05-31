const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.vue')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('leading-relaxed')) {
        content = content.replace(/leading-relaxed/g, 'leading-normal');
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Fixed:', file);
    }
});
console.log('Total files fixed:', changed);
