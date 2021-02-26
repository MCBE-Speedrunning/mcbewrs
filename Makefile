DIST := dist
SRC := src

SRC_FILES := $(shell find ./$(SRC))

# Configure this depending on if you use sudo or doas
SU := doas

all:
	rm -rf $(DIST)
	mkdir -p $(DIST)/{data,views,public}
	cp -r $(SRC)/data $(SRC)/views $(SRC)/public $(DIST)
	tsc
	find ./dist/ -name '*.ts' -type f -delete
	sass --update dist/public/cdn/stylesheets/

.PHONY: clean format run
clean:
	rm -rf $(DIST) .sass-cache/ cache/

run:
	$(SU) npm start