# Congress Changes

[Congress Changes](https://www.twitter.com/congresschanges) is a bot/small app written in NodeJS that tweets out changes to congressional accounts - renames, deactivations, test reactivations, accounts made private, header images, URLs, descriptions and profile pictures.

Originally, the bot discovered changes as part of the [Congressional Tweet Automator](https://github.com/alexlitel/congresstweets-automator)/scraper's daily self-maintenance process that checks for any changes to the underlying user/member dataset, and relied on a Redis store and ran on Heroku. But I revamped the code to run as a Serverless app to encompass more types of changes and run more frequently (about every 10 minutes vs once a day), and use an S3 JSON file to maintain state + SNS services to communicate through the various parts. It still, however, relies on the same Twitter list and user dataset as the Tweet Automator.

Inside `src/handlers`, there a handful of handler functions:
* apiEndpoint - an API endpoint to be able to ping when the Congressional dataset is updated
* updateData - runs after the API endpoint is pinged (via SNS message) and merges the new/old datasets and prevents false positives
* checkList - runs every 10 minutes to check for changes, if there are changes sends SNS message with changes in a structured format
* tweetChanges - receives the SNS message from checkList and creates a tweet for each individual change. Creates image for image or description changes; all other changes are purely text.

Inside `src/utils`, a bunch of utilities for most application logic for normalizing data, Twitter API requests, creating images, interfacing with AWS. Given that it deals with structured data, image generation, AWS, et al, only some utilities have tests to avoid absurd or useless mocks. 

For image generation, node-canvas is used. Because node-canvas cannot easily run on AWS, this app depends on two layers from [jwerre's node-canvas-lambda](https://github.com/jwerre/node-canvas-lambda) with the necessary Linux libraries and the compiled canvas library. Additionally, there is a `src/static` to house the fonts and font config for loading a font in the Lamdbda so text actually renders.
