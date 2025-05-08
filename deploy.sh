#!/bin/bash
git checkout .
git pull --rebase origin dev
npm install
npm run build
pm2 restart backend
