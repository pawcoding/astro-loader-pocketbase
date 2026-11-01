#!/bin/bash

# Define the local .pocketbase directory
POCKETBASE_DIR="$(pwd)/.pocketbase"

# Remove the existing .pocketbase directory if it exists
rm -rf "$POCKETBASE_DIR"

# Create the .pocketbase directory if it doesn't exist
mkdir -p "$POCKETBASE_DIR"

# Change to the .pocketbase directory
cd "$POCKETBASE_DIR"

# Get the latest release tag from PocketBase releases Atom feed
# Filter to entries with category "default" to exclude backport releases (e.g. v0.22.x)
latest_release=$(curl -s https://ganigeorgiev.com/meta/pocketbase/pocketbase/releases.atom \
  | grep -oP '(<title>v\d+\.\d+\.\d+ release</title>|<category term="[^"]+">)' \
  | paste - - \
  | grep '<category term="default">' \
  | grep -oP '(?<=<title>)(v\d+\.\d+\.\d+)(?= release</title>)' \
  | head -1)

# Determine the OS
os=$(uname -s)
case "$os" in
  Linux)   os="linux" ;;
  Darwin)  os="darwin" ;;
  MINGW*|MSYS*|CYGWIN*) os="windows" ;;
  *)
    echo "Unsupported OS: $os"
    exit 1
    ;;
esac

# Determine the architecture
arch=$(uname -m)
case "$arch" in
  x86_64)          arch="amd64" ;;
  aarch64|arm64)   arch="arm64" ;;
  armv7l)          arch="armv7" ;;
  ppc64le)         arch="ppc64le" ;;
  s390x)           arch="s390x" ;;
  *)
    echo "Unsupported architecture: $arch"
    exit 1
    ;;
esac

# Construct the download URL
download_url="https://ganigeorgiev.com/meta/pocketbase/pocketbase/download/${latest_release}/pocketbase_${latest_release#v}_${os}_${arch}.zip"

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

# Make the executable file executable (not needed on Windows)
if [ "$os" != "windows" ]; then
  chmod +x pocketbase
fi

# Clean up
rm pocketbase.zip

# Setup admin user
echo "Setting up admin user..."
pb_bin="./pocketbase"
if [ "$os" == "windows" ]; then
  pb_bin="./pocketbase.exe"
fi
$pb_bin superuser upsert test@pawcode.de test1234
if [ $? -ne 0 ]; then
  echo "Failed to setup admin user."
  exit 1
fi

echo "PocketBase ${latest_release} has been downloaded and is ready to use."
