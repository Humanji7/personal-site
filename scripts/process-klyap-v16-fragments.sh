#!/bin/bash
# Process KLYAP v16 fragments:
# 1. Remove Gemini watermark (bottom 80px)
# 2. Make black background transparent (threshold: RGB < 15)
# 3. Trim to content bounds

set -e

INPUT_DIR="${1:-assets/klyap-v14/raw2}"
OUTPUT_BASE="assets/klyap-v16/fragments"

# Check ImageMagick
if ! command -v magick &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    brew install imagemagick
fi

# Create output dirs
mkdir -p "$OUTPUT_BASE"/{intimate,mirror,visceral,noise,vivid,flesh}

echo "=== KLYAP v16 Fragment Processing ==="
echo ""
echo "Input: $INPUT_DIR"
echo "Output: $OUTPUT_BASE"
echo ""
echo "Pipeline:"
echo "  1. Crop 120x120 from SouthEast (SynthID watermark)"
echo "  2. Black → transparent (fuzz 5%)"
echo "  3. Auto-trim empty edges"
echo ""

# Layer distribution: intimate=3, mirror=3, visceral=3, noise=2, vivid=5, flesh=4
# Total: 20 files

file_index=0
layers=("intimate" "intimate" "intimate" 
        "mirror" "mirror" "mirror" 
        "visceral" "visceral" "visceral" 
        "noise" "noise" 
        "vivid" "vivid" "vivid" "vivid" "vivid" 
        "flesh" "flesh" "flesh" "flesh")

layer_counts=()
for layer in "${layers[@]}"; do
    layer_counts[$layer]=$((${layer_counts[$layer]:-0} + 0))
done

# Reset counters
intimate_count=0
mirror_count=0
visceral_count=0
noise_count=0
vivid_count=0
flesh_count=0

for img in "$INPUT_DIR"/*.png "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg; do
    [ -f "$img" ] || continue
    
    if [ $file_index -ge 20 ]; then
        echo "⚠️  Extra file skipped: $img"
        continue
    fi
    
    layer="${layers[$file_index]}"
    
    # Get layer-specific counter
    case $layer in
        intimate) intimate_count=$((intimate_count + 1)); count=$intimate_count ;;
        mirror) mirror_count=$((mirror_count + 1)); count=$mirror_count ;;
        visceral) visceral_count=$((visceral_count + 1)); count=$visceral_count ;;
        noise) noise_count=$((noise_count + 1)); count=$noise_count ;;
        vivid) vivid_count=$((vivid_count + 1)); count=$vivid_count ;;
        flesh) flesh_count=$((flesh_count + 1)); count=$flesh_count ;;
    esac
    
    padded=$(printf "%03d" $count)
    output="$OUTPUT_BASE/$layer/fragment-${padded}.png"
    
    filename=$(basename "$img")
    echo "  [$((file_index + 1))] $filename → $layer/fragment-${padded}.png"
    
    # Pipeline:
    # 1. Crop 120x120 from SouthEast to remove SynthID watermark
    # 2. Make near-black pixels transparent
    # 3. Trim empty edges
    magick "$img" \
        -gravity SouthEast -chop 120x120 \
        -fuzz 5% -transparent black \
        -trim +repage \
        "$output"
    
    file_index=$((file_index + 1))
done

echo ""
echo "=== Processing Complete ==="
echo ""
echo "Results:"
for layer in intimate mirror visceral noise vivid flesh; do
    count=$(find "$OUTPUT_BASE/$layer" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
    echo "  $layer: $count files"
done
echo ""
echo "Total processed: $file_index files"
