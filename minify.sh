#!/bin/bash
# ========================================================
#  SMART CODE CLEANER - PRO EDITION
#  Description: Removes comments & empty lines intelligently.
#  Safe for: URLs (https://), Strings ("..."), and Regex.
#  Dependencies: None (Uses system Perl/Sed).
# ========================================================
echo "🚀 Starting Smart Optimization Process..."
# --- Function: Process Files Safely ---
clean_file() {
    local file=$1
    echo "   ⚡ Processing: $file"
    # PERL MAGIC EXPLANATION:
    # 1. ((["\047]).*?\2)  -> Matches content inside Quotes (" or ') and keeps it Safe ($1).
    # 2. (\/\*[\s\S]*?\*\/) -> Matches Block Comments () and deletes them.
    # 3. (\/\/.*)           -> Matches Line Comments (
    perl -0777 -pi -e 's/((["\047]).*?\2)|(\/\*[\s\S]*?\*\/|\/\/.*)/$1/g' "$file"
    # Remove Empty Lines (Leaves code compact)
    sed -i '/^\s*$/d' "$file"
}
# --- 1. Optimize Javascript & CSS ---
# Finds all .js and .css files, excluding .min.js or .min.css files to avoid reprocessing
echo "📂 Scanning JS & CSS assets..."
find . -type f \( -name "*.js" -o -name "*.css" \) -not -path '*/.*' -not -name "*.min.*" | while read -r file; do
    clean_file "$file"
done
# --- 2. Optimize HTML ---
echo "📂 Scanning HTML templates..."
find . -type f -name "*.html" -not -path '*/.*' | while read -r file; do
    echo "   ⚡ Processing: $file"
    # Remove HTML Comments perl -0777 -pi -e 's
    # Remove Empty Lines
    sed -i '/^\s*$/d' "$file"
done
# --- Completion ---
echo "=========================================="
echo "✅ SUCCESS: All files cleaned and optimized."
echo "=========================================="
