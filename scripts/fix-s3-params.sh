#!/bin/bash
# Quick fix for S3 interface parameters

sed -i 's/\bstate:/\_state:/g' packages/sim/src/economy/soul-forging-*.ts
sed -i 's/\btype:/\_type:/g' packages/sim/src/economy/soul-forging-costs.ts
sed -i 's/\bcurrentLevels:/\_currentLevels:/g' packages/sim/src/economy/soul-forging-costs.ts
sed -i 's/\bavailableArcana:/\_availableArcana:/g' packages/sim/src/economy/soul-forging-manager.ts
sed -i 's/\bavailableSoulPower:/\_availableSoulPower:/g' packages/sim/src/economy/soul-forging-manager.ts
sed -i 's/\bavailableCurrency:/\_availableCurrency:/g' packages/sim/src/economy/soul-forging-manager.ts
sed -i 's/\bkey:/\_key:/g' packages/sim/src/economy/soul-forging-persistence.ts
sed -i 's/\boldState:/\_oldState:/g' packages/sim/src/economy/soul-forging-persistence.ts
sed -i 's/\btargetVersion:/\_targetVersion:/g' packages/sim/src/economy/soul-forging-persistence.ts
sed -i 's/\blevel:/\_level:/g' packages/sim/src/economy/soul-forging-costs.ts

echo "✅ Fixed interface parameters in S3 files"

