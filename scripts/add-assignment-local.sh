#!/bin/sh
value=`cat ./data.json`
npm run build
npm run invoke-local -- addAssignment --data "$value"