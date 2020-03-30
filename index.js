const axios = require('axios')

const BLUE = 3447003;
const RED = 15158332;
const GREEN = 3066993;

module.exports.subscribeDiscord = function(event, context) {
  const build = eventToBuild(event.data)
  const status = ['WORKING', 'SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT']

  if (!status.includes(build.status)) return;

  const buildStatus = build.status
  const substitutions = build.substitutions
  const branch = substitutions.BRANCH_NAME
  const repo = substitutions.REPO_NAME
  const commit = substitutions.COMMIT_SHA
  const commitUrl = `https://github.com/radiuszon/${repo}/commit/${commit}`

  axios.post(process.env.DISCORD_WEBHOOK_URL, {
    embeds: [{
      title: `${repo}@${branch} is currently ${buildStatus.toLowerCase()}`,
      description: `commit ${commit}`,
      color: getColor(buildStatus),
      url: commitUrl
    }]
  })
}

const eventToBuild = (data) => {
  return JSON.parse(Buffer.from(data, 'base64').toString())
}

const getColor = statusIndex => ({SUCCESS: GREEN, WORKING: BLUE}[statusIndex] || RED)