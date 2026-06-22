const fs = require('fs');
const path = require('path');

const replacements = {
    "bg-[#0a0a0a]": "dark:bg-[#0a0a0a] bg-gray-50",
    "bg-[#111]": "dark:bg-[#111] bg-gray-100",
    "bg-[#050505]": "dark:bg-[#050505] bg-white",
    "text-white": "dark:text-white text-gray-900",
    "text-silver": "dark:text-silver text-gray-600",
    "border-white/10": "dark:border-white/10 border-black/10",
    "border-white/5": "dark:border-white/5 border-black/5",
    "border-white/20": "dark:border-white/20 border-black/20",
    "bg-black/80": "dark:bg-black/80 bg-white/80",
    "bg-black/90": "dark:bg-black/90 bg-white/90",
    "bg-black/95": "dark:bg-black/95 bg-white/95",
    "bg-black/60": "dark:bg-black/60 bg-white/60",
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let original = fs.readFileSync(filePath, 'utf8');
        let content = original;
        
        for (const [oldVal, newVal] of Object.entries(replacements)) {
            if (!content.includes(newVal)) {
                content = content.split(oldVal).join(newVal);
            }
        }
        
        if (original !== content) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
