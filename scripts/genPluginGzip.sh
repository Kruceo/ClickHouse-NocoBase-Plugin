mv dist .dist 
mkdir -p ./dist/package/
cp -r .dist ./dist/package/dist
cp server.js   ./dist/package
cp server.d.ts ./dist/package
cp client.js   ./dist/package
cp client.d.ts ./dist/package
cp package.json ./dist/package
cp README.md ./dist/package
cp LICENSE ./dist/package
cd dist/package
tar -czf ../clickhouse-database-plugin.tgz ./
cd ../..

rm -r .dist
# rm -r dist/package