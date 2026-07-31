all: check build test

check:
	npm run lint

build:
	npm run build

test:
	npm test

slow-test:
	npm run test:slow

clean:
	npm run clean

pack:
	npm pack

.PHONY: all check build test slow-test clean pack
