
# Discord gcloud build bot

## Generate Github token
Setting > Developer settings > Personal access tokens

selects following scopes

- [x] repo
  - [x] repo:status
  - [x] repo_deployment
  - [x] public_repo
  - [x] repo:invite
  - [x] security_events
- [ ] user
  - [x] read:user
  - [x] user:email

## To deploy to cloud function

  

First deployment, create .env.yaml providing access url and token

```
DISCORD_WEBHOOK_URL: __URL__
GITHUB_API_TOKEN: __TOKEN__
OWNER_NAME: __NAME__
```

and run following command,  

```

gcloud functions deploy subscribeDiscord --trigger-topic cloud-builds --runtime nodejs14 --env-vars-file .env.yaml

```

and later,

```
npm run deploy
```