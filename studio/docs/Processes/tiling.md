---
sidebar_position: 1
---
# Image Tiling

## Overview

The tiling process in Studio divides large images into smaller tiles that are more manageable for annotation and processing. This document explains the actual implementation from the `axons-teaching` repository.

## Core Implementation

The tiling functionality is implemented in the `process_images` and `tile_image` functions, which you can find in the `axons/data/preprocessing.py` file:

```python
def process_images(image_paths, output_folder, downsample=False, model_path=None):
    """
    Process a list of images by tiling them into smaller pieces.
    
    Parameters:
    - image_paths: List of paths to input images
    - output_folder: Where to save the tiles
    - downsample: Whether to reduce resolution
    - model_path: Optional path to a segmentation model for automatic mask generation
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Create a subfolder for masks
    mask_folder = os.path.join(output_folder, "masks")
    if not os.path.exists(mask_folder):
        os.makedirs(mask_folder)

    # Save JSON files in the same folder as the tiles
    json_folder = output_folder

    model = None
    image_processor = None
    device = None

    if model_path is not None:
        model, image_processor, device = load_segmentation_model(model_path)
        model.eval()

    for image_path in tqdm(image_paths, desc="Processing images"):
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        tile_count = 0

        for tile in tile_image(image_path, tile_size=(512, 512), downsample=downsample):
            # Convert tile to RGB
            tile_rgb = tile.convert("RGB")

            # Save the original tile
            tile_name = f"{base_name}_tile_{tile_count:04d}.png"
            tile_rgb.save(os.path.join(output_folder, tile_name))

            if model is not None:
                # Process the tile for segmentation
                inputs = image_processor(images=tile_rgb, return_tensors="pt")
                inputs = {k: v.to(device) for k, v in inputs.items()}

                with torch.no_grad():
                    outputs = model(**inputs)
                    logits = outputs.logits
                    probs = torch.softmax(logits, dim=1)
                    tile_mask = (probs[0, 1].cpu().numpy() > 0.5).astype(np.uint8) * 255

                # Save the segmentation mask in the mask subfolder
                mask_name = f"{base_name}_tile_{tile_count:04d}_mask.png"
                mask_path = os.path.join(mask_folder, mask_name)
                Image.fromarray(tile_mask).save(mask_path)

                # Generate and save JSON representation
                json_name = f"{base_name}_tile_{tile_count:04d}__labels.json"
                json_path = os.path.join(json_folder, json_name)
                binary_mask_to_json(tile_mask, json_path, tile_name)

            tile_count += 1
```

The actual tiling function:

```python
def tile_image(image_path, tile_size=(500, 500), downsample=False):
    """
    Generator function that yields tiles from a large image.
    
    Parameters:
    - image_path: Path to the image to tile
    - tile_size: Size of each tile (width, height)
    - downsample: Whether to reduce the image size before tiling
    
    Yields:
    - PIL.Image tiles
    """
    image = Image.open(image_path)

    # Optionally downsample large images
    if downsample:
        image = image.resize((image.width // 3, image.height // 3), Image.LANCZOS)

    img_width, img_height = image.size

    x_tiles = img_width // tile_size[0]
    y_tiles = img_height // tile_size[1]

    # Process main grid of tiles
    for y in range(0, y_tiles * tile_size[1], tile_size[1]):
        for x in range(0, x_tiles * tile_size[0], tile_size[0]):
            tile = image.crop((x, y, x + tile_size[0], y + tile_size[1]))
            yield tile

    # Handle remaining right edge
    if img_width % tile_size[0] != 0:
        for y in range(0, y_tiles * tile_size[1], tile_size[1]):
            tile = image.crop((img_width - tile_size[0], y, img_width, y + tile_size[1]))
            yield tile

    # Handle remaining bottom edge
    if img_height % tile_size[1] != 0:
        for x in range(0, x_tiles * tile_size[0], tile_size[0]):
            tile = image.crop((x, img_height - tile_size[1], x + tile_size[0], img_height))
            yield tile

    # Handle bottom-right corner if needed
    if img_width % tile_size[0] != 0 and img_height % tile_size[1] != 0:
        tile = image.crop((img_width - tile_size[0], img_height - tile_size[1], img_width, img_height))
        yield tile
```

## Tiling Process Details

The tiling approach implemented in the code has several important characteristics:

### 1. Image Loading and Preprocessing

- Uses PIL (Python Imaging Library) to load images
- Disables maximum image size restrictions with `Image.MAX_IMAGE_PIXELS = None`
- Optionally downsamples large images by a factor of 3 using `Image.LANCZOS` resampling

### 2. Tile Generation Strategy

The `tile_image` function implements a systematic approach to dividing images:

1. **Main Grid**: Creates a grid of non-overlapping tiles of the specified size
2. **Edge Handling**: Specifically handles the right edge, bottom edge, and bottom-right corner
3. **Complete Coverage**: Ensures the entire image is covered by tiles, with some tiles potentially overlapping at the edges

### 3. Tile Size and Naming

- Default tile size is 512×512 pixels
- Tiles are named systematically: `{original_filename}_tile_{sequential_number}.png`
- The sequential numbering creates a consistent order for processing

### 4. Optional Automatic Segmentation

If a model path is provided, the code can automatically:
- Generate segmentation masks for each tile
- Save masks as PNG files in a "masks" subfolder
- Convert masks to JSON annotation format compatible with the annotation tool

### 5. JSON Annotation Generation

For pre-segmented images, the `binary_mask_to_json` function:
- Identifies connected components in the segmentation mask
- Converts binary masks to polygon regions
- Creates JSON annotation files in the format expected by the annotation tool

## Tiling Algorithm Visualization

The tiling approach can be visualized as:

```
┌───────────────────────────────┐
│                               │
│                               │
│        Original Image         │
│                               │
│                               │
└───────────────────────────────┘
                ↓
┌─────┬─────┬─────┬─────┐┌─────┐
│Tile │Tile │Tile │Tile ││Right│
│ 0   │ 1   │ 2   │ 3   ││Edge │
├─────┼─────┼─────┼─────┤│Tiles│
│Tile │Tile │Tile │Tile ││     │
│ 4   │ 5   │ 6   │ 7   ││     │
├─────┼─────┼─────┼─────┤│     │
│Tile │Tile │Tile │Tile ││     │
│ 8   │ 9   │ 10  │ 11  ││     │
└─────┴─────┴─────┴─────┘└─────┘
┌─────┬─────┬─────┬─────┐┌─────┐
│Bottom Edge Tiles       ││Corner│
└─────┴─────┴─────┴─────┘└─────┘
```

The algorithm specifically handles the edges and corner, which is important for images that aren't exact multiples of the tile size.

## Machine Learning Considerations

### 1. Tile Size Selection

The default tile size of 512×512 pixels is chosen because:
- It's compatible with most deep learning architectures
- It provides a good balance between context and detail
- It fits well in GPU memory during processing

### 2. Downsampling Option

The optional downsampling (reducing image size by 3×):
- Makes processing extremely large images more manageable
- Preserves enough detail for many scientific image analysis tasks
- Can significantly reduce processing time and memory usage

### 3. Integration with Segmentation

The tiling process integrates with segmentation by:
- Optionally applying a segmentation model to each tile
- Generating mask files for each tile
- Creating JSON annotations that can be used for training or refinement

## Usage in the ML Pipeline

In the overall machine learning workflow:

1. **Image Upload**: Large images are uploaded to the platform
2. **Tiling**: Images are split into manageable tiles using this process
3. **Annotation**: Users can annotate tiles or refine automatically generated annotations
4. **Training Set Creation**: Selected tiles are grouped into training sets
5. **Model Training**: Models are trained on the annotated tiles
6. **Inference**: Trained models are applied to new images, processed as tiles

## References

This implementation is found in the following files in the `axons-teaching` repository:
- `axons/data/preprocessing.py` - Contains the `process_images` and `tile_image` functions
- `axons/utils/model_loader.py` - Contains the helper function for loading segmentation models