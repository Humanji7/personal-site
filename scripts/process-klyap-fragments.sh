#!/bin/bash
# Process KLYAP v14 fragments:
# 1. Remove Gemini watermark (bottom-right corner)
# 2. Make black background transparent
# 3. Trim to content bounds

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

echo "Processing images from $INPUT_DIR..."
echo "  - Removing Gemini watermark (bottom-right 60x60px)"
echo "  - Converting black to transparent"
echo "  - Trimming to content bounds"
echo ""

count=0
for img in "$INPUT_DIR"/*.png "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    name="${filename%.*}"
    
    count=$((count + 1))
    padded=$(printf "%03d" $count)
    
    output="$OUTPUT_DIR/fragment-${padded}.png"
    
    echo "  [$count] $filename"
    
    # Pipeline:
    # 1. Crop off SynthID watermark (120px from bottom-right to fully remove star)
    # 2. Make near-black pixels transparent
    # 3. Trim to content bounds
    magick "$img" \
        -gravity SouthEast -chop 120x120 \
        -fuzz 10% -transparent black \
        -trim +repage \
        "$output"
done

echo ""
echo "Done! Processed $count images to $OUTPUT_DIR"
echo ""
echo "Note: Dark text inside fragments may be semi-transparent."
echo "This is expected - fragments will be displayed on dark backgrounds."
