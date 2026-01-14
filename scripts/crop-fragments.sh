#!/bin/bash
# Auto-crop KLYAP v14 fragments
# Removes black void around each fragment

set -e

INPUT_DIR="${1:-assets/klyap-v14/raw}"
OUTPUT_DIR="${2:-assets/klyap-v14/fragments}"

# Check ImageMagick
if ! command -v magick &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    brew install imagemagick
fi

# Create output dir
mkdir -p "$OUTPUT_DIR"

# Process all images
echo "Processing images from $INPUT_DIR..."

count=0
for img in "$INPUT_DIR"/*.png "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    name="${filename%.*}"
    ext="${filename##*.}"
    
    # Sequential numbering
    count=$((count + 1))
    padded=$(printf "%03d" $count)
    
    output="$OUTPUT_DIR/fragment-${padded}.png"
    
    echo "  [$count] $filename"
    magick "$img" -fuzz 5% -trim +repage "$output"
done

echo ""
echo "Done! Cropped $count images to $OUTPUT_DIR"
