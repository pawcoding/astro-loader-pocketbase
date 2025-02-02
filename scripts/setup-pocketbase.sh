#!/bin/bash

# Define the local .pocketbase directory
POCKETBASE_DIR="$(pwd)/.pocketbase"

# Remove the existing .pocketbase directory if it exists
rm -rf "$POCKETBASE_DIR"

# Create the .pocketbase directory if it doesn't exist
mkdir -p "$POCKETBASE_DIR"

# Change to the .pocketbase directory
cd "$POCKETBASE_DIR"

# Get the latest release tag from PocketBase GitHub releases
latest_release=$(curl -s https://api.github.com/repos/pocketbase/pocketbase/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')

# Determine the architecture
arch=$(uname -m)
if [ "$arch" == "x86_64" ]; then
  arch="amd64"
elif [ "$arch" == "aarch64" ]; then
  arch="arm64"
else
  echo "Unsupported architecture: $arch"
  exit 1
fi

# Construct the download URL
download_url="https://github.com/pocketbase/pocketbase/releases/download/${latest_release}/pocketbase_${latest_release#v}_linux_${arch}.zip"

# Download the latest release
echo "Downloading PocketBase ${latest_release}..."
curl -s -L -o pocketbase.zip $download_url

# Check if the download was successful
if [ $? -ne 0 ]; then
  echo "Failed to download PocketBase release."
  exit 1
fi

# Extract the executable from the zip file
echo "Extracting PocketBase ${latest_release}..."
unzip -qq pocketbase.zip
if [ $? -ne 0 ]; then
  echo "Failed to unzip PocketBase release."
  exit 1
fi

# Make the executable file executable
chmod +x pocketbase

# Clean up
rm pocketbase.zip

# Setup admin user
echo "Setting up admin user..."
./pocketbase superuser upsert test@pawcode.de test1234
if [ $? -ne 0 ]; then
  echo "Failed to setup admin user."
  exit 1
fi

echo "PocketBase ${latest_release} has been downloaded and is ready to use."
