# Github Spy

> A Node.JS script that runs periodically (cron) and reviews activity of the unwilling participant and publishes the activity/findings to an analytics engine (keen.io).

Review the [blog post](https://medium.com/p/10931799b7f0) about the Github Spy.

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

- [License](#license)

## Background
Sometimes (e.g. running a coding school) you need to track how developers are interacting with GitHub. This simple script/bot reports the last public activities for a user and using Keen.IO you can make decisions of the developer/group.

While at [Code RGV](http://codergv.org), I created GitHub Spy to review our students. We needed to ensure that students are modeling good behavior of software developers. Trust but verify, if you will.

### Examples
The following developers were randomly picked from the trending projects.

![](http://new.tinygrab.com/5f83f344cea04a0080e2b053fe85439d2df16dbaaf.png)
![](http://new.tinygrab.com/5f83f344ceb8de6e223baf73d2d021bc06ccfc4f82.png)

## Install

This project stands on the shoulder of giants:

 * [Node.JS](https://nodejs.org/en/) 0.60+
 * [Github API JS Client](https://www.npmjs.com/package/github)
 * [Keen IO Tracking Client](https://www.npmjs.com/package/keen-tracking)
 * [RedHat OpenShift](https://openshift.redhat.com)

To get started:

```sh
git clone https://github.com/ibolmo/github-spy
cd github-spy
npm install
```

### `users.js` file
Update this file to include all the users you'd like to track.

### `.env` file
The project includes a `.env.example` file. This file needs to be copied, and updated with the correct values for each environment variable. A `.env` is used to protect your secret from the public. Learn more in the [motdotla/dotenv](https://github.com/motdotla/dotenv) repository. _It's also handy when deploying to OpenShift_.

```sh
cp .env.example .env
vim .env
```

## Usage

```sh
npm run spy
```

### Optional: Publish to OpenShift
Be sure to get a free account at [RedHat's OpenShift](https://openshift.redhat.com). Review the [OpenShift getting started](https://developers.openshift.com/getting-started/).

```sh
# create sample app on openshift
rhc app create GitHubSpy nodejs-0.10
cd GitHubSpy
git remote show origin # write down the url

# go back to this cloned repo
cd ../github-spy

# update the openshift environment variables
# recommendation: create a .env.prod with new keen.io key
rhc set-env .env.prod -a GitHubSpy

git remote add openshift ssh://...your.url..
git push -f openshift
```

## License

[MIT © Olmo Maldonado](../LICENSE)
