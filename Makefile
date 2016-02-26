all:
	rm -rf gosha
    npm install
	mkdir gosha
	node ./node_modules/webpack/bin/webpack.js --config webpack.config.js
	rsync -av --exclude-from '.goshaignore' . ./gosha
	rm -rf ./out
	rm -rf ./1..
