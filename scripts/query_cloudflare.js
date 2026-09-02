// Queries Cloudflare Web Analytics (GraphQL API, rumPageloadEventsAdaptiveGroups)
// for segundafundacion.com.ar traffic and writes data/cloudflare-latest.json.
// Requires CF_API_TOKEN, CF_ACCOUNT_ID, CF_WEB_ANALYTICS_SITE_TAG in the environment
// (set as GitHub Actions secrets on this repo).
const fs = require('fs');

const days = parseInt(process.argv[2] || '30', 10);

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

const end = new Date();
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - days);

async function gql(query, variables) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function main() {
  const commonVars = {
    accountTag: process.env.CF_ACCOUNT_ID,
    siteTag: process.env.CF_WEB_ANALYTICS_SITE_TAG,
    start: fmtDate(start),
    end: fmtDate(end),
  };

  const data = await gql(
    `query($accountTag: string!, $siteTag: string!, $start: Date!, $end: Date!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          byDate: rumPageloadEventsAdaptiveGroups(
            limit: 1000
            filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }
            orderBy: [date_ASC]
          ) { count sum { visits } dimensions { date } }
          byPath: rumPageloadEventsAdaptiveGroups(
            limit: 20
            filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }
            orderBy: [count_DESC]
          ) { count dimensions { requestPath } }
          byReferer: rumPageloadEventsAdaptiveGroups(
            limit: 20
            filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }
            orderBy: [count_DESC]
          ) { count dimensions { refererHost } }
          byCountry: rumPageloadEventsAdaptiveGroups(
            limit: 20
            filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }
            orderBy: [count_DESC]
          ) { count dimensions { countryName } }
          byDevice: rumPageloadEventsAdaptiveGroups(
            limit: 10
            filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }
            orderBy: [count_DESC]
          ) { count dimensions { deviceType } }
        }
      }
    }`,
    commonVars
  );

  const acc = data.viewer.accounts[0];
  const totalPageviews = acc.byDate.reduce((s, r) => s + r.count, 0);
  const totalVisits = acc.byDate.reduce((s, r) => s + r.sum.visits, 0);

  const summary = {
    generatedAt: new Date().toISOString(),
    rangeStart: commonVars.start,
    rangeEnd: commonVars.end,
    totalPageviews,
    totalVisits,
    byDate: acc.byDate.map((r) => ({ date: r.dimensions.date, pageviews: r.count, visits: r.sum.visits })),
    topPages: acc.byPath.map((r) => ({ path: r.dimensions.requestPath, pageviews: r.count })),
    topReferrers: acc.byReferer.map((r) => ({ referer: r.dimensions.refererHost || '(direct)', pageviews: r.count })),
    topCountries: acc.byCountry.map((r) => ({ country: r.dimensions.countryName || '(unknown)', pageviews: r.count })),
    byDevice: acc.byDevice.map((r) => ({ device: r.dimensions.deviceType, pageviews: r.count })),
  };

  fs.writeFileSync('data/cloudflare-latest.json', JSON.stringify(summary, null, 2));
  console.log('Wrote data/cloudflare-latest.json:', { totalPageviews, totalVisits });
}

main().catch((e) => {
  console.error('Error consultando Cloudflare Analytics:', e.message);
  process.exit(1);
});
