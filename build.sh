#!/bin/sh -ex

preview() {
  xdg-open site/index.html
}

deploy() {
  rsync -vzr --delete -e 'ssh -i ~/.ssh/cyanyevr' site/  cyanyevr@93.125.99.125:public_html
  echo "Deployed to https://ychbn.com"
}

"${@:-preview}"
