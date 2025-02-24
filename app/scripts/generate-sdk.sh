#! /bin/bash
set -euo pipefail

# Input swagger file
INPUT_FILE="swagger-spec.json"

# Output directory
OUTPUT_DIR="sdk/src"

mkdir -p $OUTPUT_DIR

# Generate SDK
npx @openapitools/openapi-generator-cli generate \
  -i $INPUT_FILE \
  -g typescript-axios \
  -o $OUTPUT_DIR \
  --additional-properties=supportES6=true, npmName=@alumniei/sdk, npmVersion=0.0.1, withInterfaces=true
