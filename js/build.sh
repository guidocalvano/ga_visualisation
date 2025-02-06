#!/bin/bash


nvm install v18.12.1
nvm use v18.12.1

npx rollup -c rollup-three.config.mjs
npx rollup -c rollup-three-fiber.config.mjs
npx rollup -c rollup-three-drei.config.mjs


