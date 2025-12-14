#!/bin/bash

# Script to create a GitHub repository and push code
# Usage: ./create-github-repo.sh <github-username> <repo-name> [github-token]

GITHUB_USERNAME=$1
REPO_NAME=$2
GITHUB_TOKEN=$3

if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "Usage: $0 <github-username> <repo-name> [github-token]"
    echo ""
    echo "If you provide a GitHub token, the script will create the repository automatically."
    echo "Otherwise, you'll need to create it manually on GitHub first."
    echo ""
    echo "Example: $0 myusername chatwoot-brevo-integration"
    exit 1
fi

# If token is provided, create repository via API
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Creating repository $REPO_NAME on GitHub..."
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$REPO_NAME\",\"description\":\"Chatwoot Dashboard App for Brevo integration\",\"private\":false}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 201 ]; then
        echo "✅ Repository created successfully!"
    elif [ "$http_code" -eq 422 ]; then
        echo "⚠️  Repository might already exist, continuing..."
    else
        echo "❌ Failed to create repository. HTTP Code: $http_code"
        echo "Response: $body"
        exit 1
    fi
else
    echo "⚠️  No GitHub token provided. Please create the repository manually:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Repository name: $REPO_NAME"
    echo "   3. Click 'Create repository'"
    echo ""
    read -p "Press Enter once you've created the repository..."
fi

# Add remote and push
echo ""
echo "Adding remote origin..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git 2>/dev/null || \
    git remote set-url origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code has been pushed to:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    exit 1
fi

