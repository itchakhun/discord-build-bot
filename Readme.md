
# Discord gcloud build bot

  

  

To deploy to cloud function

  

Change following `[YOUR_WEBHOOK_URL]` to valid url

  

```

gcloud functions deploy subscribeDiscord --trigger-topic cloud-builds --runtime nodejs10 --set-env-vars "DISCORD_WEBHOOK_URL=[YOUR_WEBHOOK_URL]"

```
