git pull
yarn build
rm -rf publish/*
cp -r dist/* publish/
git add -A
git commit -m 'release to test'
git push
