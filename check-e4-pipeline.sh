#!/bin/bash
# Script to check E4 pipeline status and identify issues

echo "=== Checking E4 Pipeline Status ==="
echo ""

# Get PR info
echo "1. Checking for PR..."
gh pr list --head feature/p1-e4-s1-arcana-drop-system --json number,title,state,url

echo ""
echo "2. Checking recent workflow runs..."
gh run list --branch feature/p1-e4-s1-arcana-drop-system --limit 10

echo ""
echo "3. Getting latest run details..."
LATEST_RUN=$(gh run list --branch feature/p1-e4-s1-arcana-drop-system --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -n "$LATEST_RUN" ]; then
    echo "Latest run ID: $LATEST_RUN"
    echo ""
    echo "4. Checking for failures..."
    gh run view $LATEST_RUN --log-failed
else
    echo "No runs found for this branch"
fi

echo ""
echo "=== Done ==="

