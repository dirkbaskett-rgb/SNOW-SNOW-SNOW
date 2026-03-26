window.officialSourceRegistry = {
  metadata: {
    compiledOn: "March 25, 2026",
    strategy:
      "Use official resort websites as the only source layer. Resorts with parsed adapters expose direct stats; the rest are linked to official report pages and remain ready for adapter expansion.",
    sources: [
      { resortId: "alta", resortName: "Alta Ski Area", url: "https://www.skiutah.com/members/alta/snowreport", fields: ["overnight", "24h", "48h", "7d", "baseDepth", "yearToDate", "updatedAt"] },
      { resortId: "aspen", resortName: "Aspen Snowmass", url: "https://www.aspensnowmass.com/four-mountains/snow-report", fields: ["rawStationData"] },
      { resortId: "banff-sunshine", resortName: "Banff Sunshine", url: "https://www.skibanff.com/conditions", fields: ["officialPage"] },
      { resortId: "big-sky", resortName: "Big Sky Resort", url: "https://www.onthesnow.com/montana/big-sky-resort/skireport", fields: ["24h", "7d", "baseDepth", "runsOpen", "liftsOpen", "updatedAt"] },
      { resortId: "bromont", resortName: "Bromont", url: "https://www.bromontmontagne.com/en", fields: ["officialPage"] },
      { resortId: "chamonix", resortName: "Chamonix Mont-Blanc", url: "https://en.chamonix.com", fields: ["officialPage"] },
      { resortId: "coronet-remarkables", resortName: "Coronet Peak + The Remarkables", url: "https://www.nzski.com/weather-report/", fields: ["officialPage"] },
      { resortId: "grand-targhee", resortName: "Grand Targhee Resort", url: "https://www.grandtarghee.com/the-mountain/cams-conditions/mountain-report", fields: ["overnight", "24h", "48h", "base", "season", "trails", "lifts", "updatedAt"] },
      { resortId: "jackson-hole", resortName: "Jackson Hole Mountain Resort", url: "https://www.jacksonhole.com/mountain-report", fields: ["since6am", "overnight", "48h", "snowDepth"] },
      { resortId: "lake-louise", resortName: "Lake Louise", url: "https://www.skilouise.com/mountain-cam-conditions/", fields: ["officialPage"] },
      { resortId: "le-massif", resortName: "Le Massif de Charlevoix", url: "https://www.lemassif.com/en", fields: ["officialPage"] },
      { resortId: "marmot", resortName: "Marmot Basin", url: "https://www.skimarmot.com/mountain-report/", fields: ["officialPage"] },
      { resortId: "megeve", resortName: "Megeve", url: "https://www.megeve.com/en/live/snow-weather", fields: ["officialPage"] },
      { resortId: "mt-buller", resortName: "Mt Buller", url: "https://www.mtbuller.com.au/Winter/snow-weather-report", fields: ["officialPage"] },
      { resortId: "niseko", resortName: "Niseko United", url: "https://www.niseko.ne.jp/en/mountain-information/weather-snow-information/", fields: ["officialPage"] },
      { resortId: "panorama", resortName: "Panorama Mountain Resort", url: "https://www.panoramaresort.com/conditions/", fields: ["officialPage"] },
      { resortId: "revelstoke", resortName: "Revelstoke Mountain Resort", url: "https://www.revelstokemountainresort.com/mountain/conditions/", fields: ["officialPage"] },
      { resortId: "snowbasin", resortName: "Snowbasin", url: "https://www.snowbasin.com/the-mountain/mountain-report/", fields: ["overnight", "24h", "7d", "base", "season", "trails", "lifts", "updatedAt"] },
      { resortId: "snowbird", resortName: "Snowbird", url: "https://www.skiutah.com/members/snowbird/snowreport", fields: ["overnight", "24h", "48h", "7d", "baseDepth", "yearToDate", "updatedAt"] },
      { resortId: "sugar-bowl", resortName: "Sugar Bowl Resort", url: "https://www.sugarbowl.com/conditions", fields: ["24h", "weekly", "season", "trails", "lifts", "updatedAt"] },
      { resortId: "sugarloaf", resortName: "Sugarloaf", url: "https://www.sugarloaf.com/mountain-report", fields: ["24h", "weekly", "snowStake", "updatedAt"] },
      { resortId: "sun-peaks", resortName: "Sun Peaks Resort", url: "https://www.sunpeaksresort.com/mountain-conditions", fields: ["officialPage"] },
      { resortId: "sun-valley", resortName: "Sun Valley", url: "https://www.sunvalley.com/the-mountain/mountain-report/", fields: ["overnight", "24h", "7d", "base", "season", "trails", "lifts", "updatedAt"] },
      { resortId: "sunday-river", resortName: "Sunday River", url: "https://www.sundayriver.com/mountain-report", fields: ["snowReport", "liftStatus", "trailStatus", "weather"] },
      { resortId: "taos", resortName: "Taos Ski Valley", url: "https://www.skitaos.com/lifts-trails/", fields: ["24h", "48h", "72h", "7d", "baseDepth", "lifts", "slopes"] },
      { resortId: "valle-nevado", resortName: "Valle Nevado", url: "https://www.vallenevado.com/en", fields: ["officialPage"] },
      { resortId: "whiteface", resortName: "Whiteface Mountain Resort", url: "https://whiteface.com/mountain/conditions/", fields: ["officialPage"] }
    ]
  },
  overrides: {
    "alta": {
      sourceType: "official",
      sourceLabel: "Ski Utah snow report",
      sourceUrl: "https://www.skiutah.com/members/alta/snowreport",
      sourceUpdatedAt: "February 14, 2026 5:00 PM UTC",
      sourceFields: ["overnight", "24h", "48h", "7d", "baseDepth", "yearToDate", "updatedAt"],
      officialStats: {
        overnightSnowfall: 0,
        snowfall24Hours: 0,
        snowfall48Hours: 1,
        snowfall72Hours: null,
        snowfall7Days: 13,
        seasonSnowfall: 154,
        baseDepthMin: 66,
        baseDepthMax: 66
      },
      sourceNotes: "Alta now uses Ski Utah's dedicated Alta snow-report page because it exposes clearer machine-readable snow totals and updated timestamps than Alta's public HTML."
    },
    "aspen": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.aspensnowmass.com/four-mountains/snow-report",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["rawStationData"],
      officialStats: {},
      sourceNotes: "Aspen Snowmass publishes separate mountain report data and raw station feeds by mountain."
    },
    "banff-sunshine": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.skibanff.com/conditions",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Banff Sunshine is now wired to an official resort conditions page instead of a pass-wide source."
    },
    "big-sky": {
      sourceType: "official",
      sourceLabel: "OnTheSnow snow report",
      sourceUrl: "https://www.onthesnow.com/montana/big-sky-resort/skireport",
      sourceUpdatedAt: "March 11, 2026",
      sourceFields: ["24h", "baseDepth", "runsOpen", "liftsOpen", "updatedAt"],
      officialStats: {},
      sourceNotes: "Big Sky's older seeded snapshot has been cleared because recent refreshes did not extract trustworthy current values. OnTheSnow appears to expose recent snowfall over a shorter window, so the app no longer treats it as a reliable 7-day source."
    },
    "bromont": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.bromontmontagne.com/en",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Bromont is linked to its official site pending a resort-specific conditions adapter."
    },
    "chamonix": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://en.chamonix.com",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Chamonix is linked to its official resort information site for future conditions parsing."
    },
    "coronet-remarkables": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.nzski.com/weather-report/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "NZSki's weather report hub is the official source for Coronet Peak and The Remarkables."
    },
    "grand-targhee": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.grandtarghee.com/the-mountain/cams-conditions/mountain-report",
      sourceUpdatedAt: "March 11, 2026 7:00 AM MT",
      sourceFields: ["overnight", "24h", "48h", "base", "season", "trails", "lifts"],
      officialStats: {},
      sourceNotes: "Grand Targhee's older seeded snapshot has been cleared so the card does not show stale snow totals as live data. Current values will appear once the live parser extracts them reliably."
    },
    "jackson-hole": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.jacksonhole.com/mountain-report",
      sourceUpdatedAt: "March 2026 official page snapshot",
      sourceFields: ["since6am", "overnight", "48h", "snowDepth"],
      officialStats: {
        since6amSnowfall: 0,
        overnightSnowfall: 0,
        snowfall24Hours: null,
        snowfall48Hours: 0,
        snowfall72Hours: null,
        snowfall7Days: null,
        seasonSnowfall: null,
        baseDepthMin: 0,
        baseDepthMax: 0,
        trailsOpen: null,
        trailsTotal: null,
        liftsOpen: null,
        liftsTotal: null
      },
      sourceNotes: "Jackson Hole's official report exposed since-6AM, overnight, 48-hour, and snow-depth stats in the captured snapshot."
    },
    "lake-louise": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.skilouise.com/mountain-cam-conditions/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Lake Louise is linked to its official resort site pending a dedicated report adapter."
    },
    "le-massif": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.lemassif.com/en",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Le Massif is linked to its official resort site pending conditions parsing."
    },
    "marmot": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.skimarmot.com/mountain-report/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Marmot Basin is linked to its official resort site pending a specific mountain report adapter."
    },
    "megeve": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.megeve.com/en/live/snow-weather",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Megeve is linked to the official resort site and ready for a destination-specific adapter."
    },
    "mt-buller": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.mtbuller.com.au/Winter/snow-weather-report",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Mt Buller now points to its official snow and weather report page."
    },
    "niseko": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.niseko.ne.jp/en/mountain-information/weather-snow-information/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Niseko United is linked to an official weather page while a four-area adapter is still pending."
    },
    "panorama": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.panoramaresort.com/conditions/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Panorama is linked to its official conditions page for future parsing."
    },
    "revelstoke": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.revelstokemountainresort.com/mountain/conditions/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Revelstoke is linked to its official mountain conditions page."
    },
    "snowbasin": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.snowbasin.com/the-mountain/mountain-report/",
      sourceUpdatedAt: "March 11, 2026 4:34 AM MT",
      sourceFields: ["overnight", "24h", "7d", "base", "season", "trails", "lifts"],
      officialStats: {
        overnightSnowfall: 0,
        snowfall24Hours: 0,
        snowfall48Hours: null,
        snowfall72Hours: null,
        snowfall7Days: 7,
        seasonSnowfall: 124,
        baseDepthMin: 61,
        baseDepthMax: 61,
        trailsOpen: 68,
        trailsTotal: 115,
        liftsOpen: 8,
        liftsTotal: 13
      },
      sourceNotes: "Snowbasin's official mountain report exposed overnight, 24-hour, 7-day, base, season, trails, and lifts."
    },
    "snowbird": {
      sourceType: "official",
      sourceLabel: "Ski Utah snow report",
      sourceUrl: "https://www.skiutah.com/members/snowbird/snowreport",
      sourceUpdatedAt: "February 28, 2026 1:01 PM UTC",
      sourceFields: ["overnight", "24h", "48h", "7d", "baseDepth", "yearToDate", "updatedAt"],
      officialStats: {
        overnightSnowfall: 0,
        snowfall24Hours: 0,
        snowfall48Hours: 0,
        snowfall72Hours: null,
        snowfall7Days: 5,
        seasonSnowfall: 203,
        baseDepthMin: 86,
        baseDepthMax: 86
      },
      sourceNotes: "Snowbird now uses Ski Utah's dedicated Snowbird snow-report page because it exposes clearer updated timestamps, snow totals, and base depth than the crawlable Snowbird HTML."
    },
    "sugar-bowl": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.sugarbowl.com/conditions",
      sourceUpdatedAt: "December 27, 2025 4:49 PM",
      sourceFields: ["24h", "weekly", "season", "trails", "lifts"],
      officialStats: {},
      sourceNotes: "Sugar Bowl's old seeded snapshot has been cleared so the card does not show stale snow totals as current data. Live values will appear once the parser is updated."
    },
    "sugarloaf": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.sugarloaf.com/mountain-report",
      sourceUpdatedAt: "December 27, 2025 4:49 PM",
      sourceFields: ["24h", "weekly", "yearToDate", "lifts", "runsOpen", "updatedAt"],
      officialStats: {},
      sourceNotes: "Sugarloaf's old seeded snapshot has been cleared so the card does not show stale snow totals as current data. Live values will appear once the parser is updated."
    },
    "sun-peaks": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.sunpeaksresort.com/mountain-conditions",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Sun Peaks is linked to its official mountain conditions page."
    },
    "sun-valley": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.sunvalley.com/the-mountain/mountain-report/",
      sourceUpdatedAt: "March 10, 2026 4:51 AM MT",
      sourceFields: ["overnight", "24h", "7d", "base", "season", "trails", "lifts"],
      officialStats: {
        overnightSnowfall: 0,
        snowfall24Hours: 0,
        snowfall48Hours: null,
        snowfall72Hours: null,
        snowfall7Days: 0,
        seasonSnowfall: 101,
        baseDepthMin: 74,
        baseDepthMax: 74,
        trailsOpen: 99,
        trailsTotal: 109,
        liftsOpen: 12,
        liftsTotal: 12
      },
      sourceNotes: "Sun Valley uses Bald Mountain as the primary destination-level mountain report in this app."
    },
    "sunday-river": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.sundayriver.com/mountain-report",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["snowReport", "liftStatus", "trailStatus", "weather"],
      officialStats: {},
      sourceNotes: "Sunday River's official mountain report exposes snow, lifts, trails, and weather sections, but the values are JS-rendered in the crawlable page."
    },
    "taos": {
      sourceType: "official",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.skitaos.com/lifts?section=weather-forecast",
      sourceUpdatedAt: "September 2, 2025 10:50 PM MST",
      sourceFields: ["24h", "48h", "72h", "7d", "baseDepth", "lifts", "slopes"],
      officialStats: {
        snowfall24Hours: 0,
        snowfall48Hours: 0,
        snowfall72Hours: 0,
        snowfall7Days: 0,
        baseDepthMin: 4,
        baseDepthMax: 4,
        liftsOpen: 4,
        liftsTotal: 10,
        trailsOpen: 0,
        trailsTotal: 0
      },
      sourceNotes: "Taos Ski Valley's official lifts-and-trails page exposed 24h, 48h, 72h, 7-day, base depth, and lift totals in the September 2, 2025 page snapshot."
    },
    "valle-nevado": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://www.vallenevado.com/en",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Valle Nevado is linked to the official resort site pending a snow-report adapter."
    },
    "whiteface": {
      sourceType: "official-link",
      sourceLabel: "Official resort report",
      sourceUrl: "https://whiteface.com/mountain/conditions/",
      sourceUpdatedAt: "Official resort page",
      sourceFields: ["officialPage"],
      officialStats: {},
      sourceNotes: "Whiteface now points to its official resort site for conditions expansion."
    }
  }
};
