import os
import glob

replacements = {
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
}

files = glob.glob('src/**/*.tsx', recursive=True)
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    # A bit naive replace but safe for utility classes
    for old, new in replacements.items():
        # Avoid replacing already replaced ones if script is run twice
        if new in content:
            continue
        content = content.replace(old, new)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
