#!/bin/bash

# Create temporary directory
mkdir -p temp_icons

# Export SVG to PNG at different sizes
svgexport public/favicon.svg temp_icons/favicon-16.png 16:16
svgexport public/favicon.svg temp_icons/favicon-32.png 32:32
svgexport public/favicon.svg temp_icons/favicon-48.png 48:48
svgexport public/favicon.svg temp_icons/favicon-64.png 64:64
svgexport public/favicon.svg temp_icons/favicon-128.png 128:128
svgexport public/favicon.svg temp_icons/favicon-256.png 256:256

# Export apple-touch-icon
svgexport public/apple-touch-icon.svg public/apple-touch-icon.png 180:180

# Export og-image
svgexport public/og-image.svg public/og-image.png 1200:630

echo "Icons generated successfully!"
