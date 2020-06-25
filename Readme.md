
# Discord gcloud build bot

  

  

To deploy to cloud function

  

First deployment, create .env.yaml providing access url and token

```
DISCORD_WEBHOOK_URL: __URL__
GITHUB_API_TOKEN: __TOKEN__
OWNER_NAME: __NAME__
```

and run following command,  

```

gcloud functions deploy subscribeDiscord --trigger-topic cloud-builds --runtime nodejs10 --env-vars-file .env.yaml

```

and later,

```
npm run deploy
```