(function () {
  const { resorts } = window.dashboardData;
  const officialRegistry = window.officialSourceRegistry || { metadata: { sources: [] }, overrides: {} };
  const liveRefreshData = window.liveRefreshData || { metadata: {}, resorts: {} };
  const noaaConfig = window.noaaForecastConfig || { metadata: {}, resorts: {} };
  const globalForecastConfig = window.globalForecastConfig || { metadata: {}, resorts: {} };
  const mapProfiles = window.resortMapProfiles || {};

  const summaryGrid = document.querySelector("#summary-grid");
  const resortGrid = document.querySelector("#resort-grid");
  const searchInput = document.querySelector("#search-input");
  const statusFilter = document.querySelector("#status-filter");
  const regionFilter = document.querySelector("#region-filter");
  const sortSelect = document.querySelector("#sort-select");
  const pageRail = document.querySelector("#page-rail");
  const pageArrowLeft = document.querySelector("#page-arrow-left");
  const pageArrowRight = document.querySelector("#page-arrow-right");
  const mapCanvas = document.querySelector("#na-map-canvas");
  const mapDetail = document.querySelector("#na-map-detail");

  const resortReportUrlById = Object.fromEntries(
    (officialRegistry.metadata?.sources || []).map((source) => [source.resortId, source.url])
  );

  const enrichedResorts = resorts.map((resort) => {
    const official = officialRegistry.overrides[resort.id];
    const officialStats = official ? official.officialStats || {} : {};
    const live = liveRefreshData.resorts?.[resort.id] || {};
    const liveStats = sanitizeLiveStats(resort.id, live.officialStats || {});

    function readPreferred(fieldName, fallbackValue) {
      if (liveStats[fieldName] !== undefined) {
        return liveStats[fieldName];
      }
      if (officialStats[fieldName] !== undefined) {
        return officialStats[fieldName];
      }
      return fallbackValue;
    }

    return {
      ...resort,
      sourceType: official?.sourceType || "onthesnow",
      sourceLabel: live.sourceLabel || "OnTheSnow snow report",
      sourceUrl: live.sourceUrl || resort.sourceUrl,
      resortReportUrl: resortReportUrlById[resort.id] || resort.officialConditionsUrl,
      sourceUpdatedAt:
        live.sourceUpdatedAt ||
        resort.freshness ||
        official?.sourceUpdatedAt ||
        "OnTheSnow report",
      sourceFields: official?.sourceFields || ["72h", "forecast", "base", "trails", "lifts"],
      sourceNotes:
        live.sourceNotes ||
        resort.notes ||
        "Current resort stats from the OnTheSnow Mountain Collective report.",
      condition: readPreferred("condition", resort.condition),
      overnightSnowfall: readPreferred("overnightSnowfall", null),
      since6amSnowfall: readPreferred("since6amSnowfall", null),
      snowfall24Hours: readPreferred("snowfall24Hours", resort.snowfall24Hours),
      snowfall48Hours: readPreferred("snowfall48Hours", resort.snowfall48Hours),
      snowfall72Hours: readPreferred("snowfall72Hours", resort.snowfall72Hours),
      snowfall7Days: readPreferred("snowfall7Days", null),
      snowfallForecast72Hours: readPreferred("snowfallForecast72Hours", resort.snowfallForecast72Hours),
      seasonSnowfall: readPreferred("seasonSnowfall", resort.seasonSnowfall),
      baseDepthMin: readPreferred("baseDepthMin", resort.baseDepthMin),
      baseDepthMax: readPreferred("baseDepthMax", resort.baseDepthMax),
      trailsOpen: readPreferred("trailsOpen", resort.trailsOpen),
      trailsTotal: readPreferred("trailsTotal", resort.trailsTotal),
      liftsOpen: readPreferred("liftsOpen", resort.liftsOpen),
      liftsTotal: readPreferred("liftsTotal", resort.liftsTotal)
    };
  });

  const state = {
    search: "",
    status: "All",
    region: "All",
    sort: "forecast",
    noaaForecasts: {},
    globalForecasts: {},
    selectedMapResortId: null,
    mapScale: 1.18,
    mapOffsetX: 0,
    mapOffsetY: 0,
    mapViewInitialized: false,
    mapUserAdjusted: false
  };

  const northAmericaResorts = enrichedResorts.filter(
    (resort) => ["USA", "Canada"].includes(resort.country) && mapProfiles[resort.id]
  );
  state.selectedMapResortId = northAmericaResorts[0]?.id || null;

  function formatInches(value) {
    if (value === null || value === undefined) {
      return "Not available";
    }
    return `${value}"`;
  }

  function sanitizeLiveStats(resortId, stats) {
    const sanitized = { ...stats };

    if (resortId === "big-sky") {
      if (sanitized.snowfall24Hours !== undefined && sanitized.snowfall24Hours > 40) {
        delete sanitized.snowfall24Hours;
      }
      if (sanitized.snowfall7Days !== undefined) {
        delete sanitized.snowfall7Days;
      }
      if (sanitized.snowfall48Hours !== undefined && sanitized.snowfall48Hours > 80) {
        delete sanitized.snowfall48Hours;
      }
      if (sanitized.snowfall72Hours !== undefined && sanitized.snowfall72Hours > 120) {
        delete sanitized.snowfall72Hours;
      }
      if (
        sanitized.liftsOpen !== undefined &&
        sanitized.liftsTotal !== undefined &&
        sanitized.liftsOpen > sanitized.liftsTotal
      ) {
        delete sanitized.liftsOpen;
        delete sanitized.liftsTotal;
      }
    }

    return sanitized;
  }

  function formatBaseDepth(resort) {
    if (resort.baseDepthMin === null && resort.baseDepthMax === null) {
      return "Not available";
    }
    if (resort.baseDepthMin === resort.baseDepthMax || resort.baseDepthMax === null) {
      return `${resort.baseDepthMin}"`;
    }
    return `${resort.baseDepthMin}"-${resort.baseDepthMax}"`;
  }

  function formatRatio(openValue, totalValue) {
    if (openValue === null || totalValue === null) {
      return "Not available";
    }
    return `${openValue}/${totalValue}`;
  }

  function formatPercent(openValue, totalValue) {
    if (!totalValue && totalValue !== 0) {
      return "Not available";
    }
    if (openValue === null || openValue === undefined) {
      return "Not available";
    }
    return `${Math.round((openValue / totalValue) * 100)}%`;
  }

  function numericOrNegativeInfinity(value) {
    return value === null || value === undefined ? Number.NEGATIVE_INFINITY : value;
  }

  function getCountryFlagCode(country) {
    const flags = {
      USA: "us",
      Canada: "ca",
      France: "fr",
      "New Zealand": "nz",
      Australia: "au",
      Japan: "jp",
      Chile: "cl"
    };

    return flags[country] || "";
  }

  function getContinent(country) {
    const continents = {
      USA: "North America",
      Canada: "North America",
      France: "Europe",
      "New Zealand": "Oceania",
      Australia: "Oceania",
      Japan: "Asia",
      Chile: "South America"
    };

    return continents[country] || "";
  }

  function getResortImageQuery(resort) {
    const overrides = {
      alta: "Alta Ski Area Utah mountain",
      aspen: "Aspen Snowmass Colorado mountain",
      "banff-sunshine": "Banff Sunshine Village mountain",
      "big-sky": "Big Sky Resort Lone Peak mountain",
      bromont: "Bromont mountain ski resort",
      chamonix: "Chamonix Mont Blanc ski mountain",
      "coronet-remarkables": "The Remarkables ski resort mountain",
      "grand-targhee": "Grand Targhee ski resort mountain",
      "jackson-hole": "Jackson Hole Mountain Resort tram mountain",
      "lake-louise": "Lake Louise Ski Resort mountain",
      "le-massif": "Le Massif de Charlevoix ski mountain",
      marmot: "Marmot Basin ski mountain",
      megeve: "Megeve ski resort mountain",
      "mt-buller": "Mt Buller ski resort mountain",
      niseko: "Niseko United ski mountain",
      panorama: "Panorama Mountain Resort ski mountain",
      revelstoke: "Revelstoke Mountain Resort mountain",
      snowbasin: "Snowbasin ski resort mountain",
      snowbird: "Snowbird Utah ski mountain",
      "sugar-bowl": "Sugar Bowl Resort ski mountain",
      sugarloaf: "Sugarloaf Maine ski mountain",
      "sun-peaks": "Sun Peaks Resort ski mountain",
      "sun-valley": "Sun Valley Bald Mountain ski resort",
      "sunday-river": "Sunday River ski resort mountain",
      taos: "Taos Ski Valley mountain",
      "valle-nevado": "Valle Nevado ski mountain",
      whiteface: "Whiteface Mountain ski resort"
    };

    return overrides[resort.id] || `${resort.name} ski mountain`;
  }

  function getLocalResortImageUrl(resort) {
    return `./images/resorts/${resort.id}.jpg`;
  }

  function getResortImageUrl(resort) {
    return getLocalResortImageUrl(resort);
  }

  function getMapResortById(resortId) {
    return northAmericaResorts.find((resort) => resort.id === resortId) || null;
  }

  function projectNorthAmericaPoint(profile) {
    if (
      profile &&
      profile.x !== null &&
      profile.x !== undefined &&
      profile.y !== null &&
      profile.y !== undefined
    ) {
      return {
        x: profile.x,
        y: profile.y
      };
    }

    if (
      !profile ||
      profile.lat === null ||
      profile.lat === undefined ||
      profile.lon === null ||
      profile.lon === undefined
    ) {
      return null;
    }

    const degToRad = (degrees) => (degrees * Math.PI) / 180;
    const projectAlbers = (lon, lat) => {
      const phi1 = degToRad(29.5);
      const phi2 = degToRad(45.5);
      const phi0 = degToRad(23);
      const lambda0 = degToRad(-96);
      const phi = degToRad(lat);
      const lambda = degToRad(lon);
      const n = 0.5 * (Math.sin(phi1) + Math.sin(phi2));
      const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
      const rho = Math.sqrt(c - 2 * n * Math.sin(phi)) / n;
      const rho0 = Math.sqrt(c - 2 * n * Math.sin(phi0)) / n;
      const theta = n * (lambda - lambda0);

      return {
        x: rho * Math.sin(theta),
        y: rho0 - rho * Math.cos(theta)
      };
    };

    const bounds = [
      [-141, 24],
      [-141, 84],
      [-52, 24],
      [-52, 84],
      [-130, 55],
      [-122, 49],
      [-114, 60],
      [-100, 70],
      [-85, 50],
      [-70, 46],
      [-62, 54]
    ].map(([lon, lat]) => projectAlbers(lon, lat));

    const minX = Math.min(...bounds.map((point) => point.x));
    const maxX = Math.max(...bounds.map((point) => point.x));
    const minY = Math.min(...bounds.map((point) => point.y));
    const maxY = Math.max(...bounds.map((point) => point.y));
    const insetLeft = 4.5;
    const insetRight = 95.5;
    const insetTop = 3.5;
    const insetBottom = 92;
    const projected = projectAlbers(profile.lon, profile.lat);
    const normalizedX = (projected.x - minX) / (maxX - minX);
    const normalizedY = (projected.y - minY) / (maxY - minY);

    return {
      x:
        insetLeft +
        normalizedX * (insetRight - insetLeft) +
        (profile.nudgeXProjected || 0),
      y:
        insetTop +
        normalizedY * (insetBottom - insetTop) +
        (profile.nudgeYProjected || 0)
    };
  }

  function getNoaaForecastPageUrl(location) {
    return `https://forecast.weather.gov/MapClick.php?lat=${location.lat}&lon=${location.lon}`;
  }

  function getFeaturedSnowMetric(resort) {
    return {
      label: "24h snow",
      value: resort.snowfall24Hours,
      note: `Overnight: ${formatInches(resort.overnightSnowfall)} / 48h: ${formatInches(
        resort.snowfall48Hours
      )}`
    };
  }

  function renderMapDetail(resortId) {
    const resort = getMapResortById(resortId) || northAmericaResorts[0];
    if (!resort || !mapDetail) {
      return;
    }

    const profile = mapProfiles[resort.id];
    const forecastValue = getForecastSnowValue(resort);
    const forecastText =
      forecastValue > Number.NEGATIVE_INFINITY ? formatInches(Number(forecastValue.toFixed(1))) : "Not available";
    const resortImageUrl = getResortImageUrl(resort);

    mapDetail.innerHTML = `
      <img src="${resortImageUrl}" alt="${resort.name} mountain view" loading="lazy" onerror="this.onerror=null;this.src='./images/resorts/placeholder.svg';" />
      <h3>${resort.name}</h3>
      <p class="map-detail-subtitle">${profile.description}</p>
      <div class="map-stat-grid">
        <div class="map-stat">
          <span>Skiable terrain</span>
          <strong>${profile.skiableTerrain}</strong>
        </div>
        <div class="map-stat">
          <span>Vertical</span>
          <strong>${profile.verticalFeet}</strong>
        </div>
        <div class="map-stat">
          <span>Average snowfall</span>
          <strong>${profile.averageSnowfall}</strong>
        </div>
        <div class="map-stat">
          <span>72h forecast</span>
          <strong>${forecastText}</strong>
        </div>
      </div>
      <p>Current status: <strong>${resort.status}</strong>. Current base depth: <strong>${formatBaseDepth(
        resort
      )}</strong>. Profile stats here are rounded mountain figures for quick comparison.</p>
      <div class="map-detail-links">
        <a href="${resort.resortReportUrl}" target="_blank" rel="noreferrer">Snow report</a>
        <a href="${resort.officialConditionsUrl}" target="_blank" rel="noreferrer">Resort homepage</a>
      </div>
    `;
  }

  function renderMapPins() {
    if (!mapCanvas) {
      return;
    }

    mapCanvas.innerHTML = `
      <div class="map-panzoom" id="na-map-panzoom">
        <img class="map-base-image" src="./USA-Canada-Map.webp" alt="USA and Canada map" draggable="false" />
        ${northAmericaResorts
          .map((resort) => {
            const profile = mapProfiles[resort.id];
            const point = projectNorthAmericaPoint(profile);
            if (!point) {
              return "";
            }
            const isActive = resort.id === state.selectedMapResortId ? " is-active" : "";
            return `
              <button
                class="map-pin${isActive}"
                type="button"
                style="left: ${point.x}%; top: ${point.y}%;"
                data-resort-id="${resort.id}"
                aria-label="${resort.name}"
              >
                <span class="map-pin-label">${resort.name}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;

    const panzoomLayer = mapCanvas.querySelector("#na-map-panzoom");

    if (!state.mapViewInitialized || !state.mapUserAdjusted) {
      const width = mapCanvas.clientWidth || 1698;
      const height = mapCanvas.clientHeight || 1550;
      state.mapScale = 1;
      state.mapOffsetX = 0;
      state.mapOffsetY = 0;
      state.mapViewInitialized = true;
    }

    if (panzoomLayer) {
      panzoomLayer.style.transform = `translate(${state.mapOffsetX}px, ${state.mapOffsetY}px) scale(${state.mapScale})`;
    }

    mapCanvas.querySelectorAll(".map-pin").forEach((pin) => {
      const activatePin = () => {
        state.selectedMapResortId = pin.dataset.resortId;
        renderMapPins();
        renderMapDetail(state.selectedMapResortId);
      };

      pin.addEventListener("mouseenter", activatePin);
      pin.addEventListener("focus", activatePin);
      pin.addEventListener("click", activatePin);
    });

    bindMapInteractions();
  }

  function clampMapTransform() {
    if (!mapCanvas) {
      return;
    }

    const width = mapCanvas.clientWidth || 960;
    const height = mapCanvas.clientHeight || 1000;
    const scaledWidth = width * state.mapScale;
    const scaledHeight = height * state.mapScale;
    const minOffsetX = Math.min(0, width - scaledWidth);
    const minOffsetY = Math.min(0, height - scaledHeight);

    state.mapOffsetX = Math.min(0, Math.max(minOffsetX, state.mapOffsetX));
    state.mapOffsetY = Math.min(0, Math.max(minOffsetY, state.mapOffsetY));
  }

  function applyMapTransform() {
    const panzoomLayer = document.querySelector("#na-map-panzoom");
    if (!panzoomLayer) {
      return;
    }

    clampMapTransform();
    panzoomLayer.style.transform = `translate(${state.mapOffsetX}px, ${state.mapOffsetY}px) scale(${state.mapScale})`;
  }

  function bindMapInteractions() {
    const panzoomLayer = document.querySelector("#na-map-panzoom");
    if (!mapCanvas || !panzoomLayer || panzoomLayer.dataset.bound === "true") {
      return;
    }

    panzoomLayer.dataset.bound = "true";

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    if (mapCanvas.dataset.wheelBound !== "true") {
      mapCanvas.dataset.wheelBound = "true";
      mapCanvas.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          const rect = mapCanvas.getBoundingClientRect();
          const pointerX = event.clientX - rect.left;
          const pointerY = event.clientY - rect.top;
          const worldX = (pointerX - state.mapOffsetX) / state.mapScale;
          const worldY = (pointerY - state.mapOffsetY) / state.mapScale;
          const zoomDelta = event.deltaY < 0 ? 1.12 : 0.9;
          const nextScale = Math.min(3.2, Math.max(1.1, state.mapScale * zoomDelta));

          state.mapScale = nextScale;
          state.mapOffsetX = pointerX - worldX * nextScale;
          state.mapOffsetY = pointerY - worldY * nextScale;
          state.mapUserAdjusted = true;
          applyMapTransform();
        },
        { passive: false }
      );
    }

    panzoomLayer.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".map-pin")) {
        return;
      }
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = state.mapOffsetX;
      originY = state.mapOffsetY;
      panzoomLayer.classList.add("is-dragging");
      panzoomLayer.setPointerCapture(event.pointerId);
    });

    panzoomLayer.addEventListener("pointermove", (event) => {
      if (!isDragging) {
        return;
      }
      state.mapOffsetX = originX + (event.clientX - startX);
      state.mapOffsetY = originY + (event.clientY - startY);
      state.mapUserAdjusted = true;
      applyMapTransform();
    });

    const stopDragging = (event) => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      panzoomLayer.classList.remove("is-dragging");
      if (event.pointerId !== undefined) {
        try {
          panzoomLayer.releasePointerCapture(event.pointerId);
        }
        catch (error) {
          // Ignore release errors from synthetic or already-released pointers.
        }
      }
    };

    panzoomLayer.addEventListener("pointerup", stopDragging);
    panzoomLayer.addEventListener("pointercancel", stopDragging);
  }

  function updatePageArrowState() {
    if (!pageRail || !pageArrowLeft || !pageArrowRight) {
      return;
    }

    const activePage = Math.round(pageRail.scrollLeft / Math.max(pageRail.clientWidth, 1));
    pageArrowLeft.classList.toggle("is-hidden", activePage === 0);
    pageArrowRight.classList.toggle("is-hidden", activePage >= 1);
  }

  function scrollToPage(pageIndex) {
    if (!pageRail) {
      return;
    }
    pageRail.scrollTo({
      left: pageRail.clientWidth * pageIndex,
      behavior: "smooth"
    });
  }

  function parseIsoDurationToHours(durationText) {
    if (!durationText) {
      return 0;
    }
    const dayMatch = durationText.match(/(\d+)D/i);
    const hourMatch = durationText.match(/(\d+)H/i);
    const minuteMatch = durationText.match(/(\d+)M/i);
    const days = dayMatch ? Number(dayMatch[1]) : 0;
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return days * 24 + hours + minutes / 60;
  }

  function sumSnowfallValuesForNext72Hours(values) {
    if (!Array.isArray(values)) {
      return null;
    }

    const now = Date.now();
    const seventyTwoHoursFromNow = now + 72 * 60 * 60 * 1000;
    let totalMillimeters = 0;
    let hadOverlap = false;

    values.forEach((entry) => {
      if (entry.value === null || entry.value === undefined) {
        return;
      }

      const [startText, durationText] = entry.validTime.split("/");
      const start = new Date(startText).getTime();
      const durationHours = parseIsoDurationToHours(durationText);
      const end = start + durationHours * 60 * 60 * 1000;
      const overlapStart = Math.max(start, now);
      const overlapEnd = Math.min(end, seventyTwoHoursFromNow);

      if (overlapEnd <= overlapStart || durationHours <= 0) {
        return;
      }

      hadOverlap = true;
      const overlapRatio = (overlapEnd - overlapStart) / (end - start);
      totalMillimeters += Number(entry.value) * overlapRatio;
    });

    if (!hadOverlap) {
      return null;
    }

    return totalMillimeters / 25.4;
  }

  function shortenForecastText(periods) {
    if (!Array.isArray(periods) || !periods.length) {
      return null;
    }
    return periods
      .filter((period) => period.isDaytime)
      .slice(0, 3)
      .map((period) => `${period.name}: ${period.shortForecast}`)
      .join(" | ");
  }

  async function fetchNoaaForecast(resortId, location) {
    const headers = {
      Accept: "application/geo+json"
    };
    const pointsResponse = await fetch(
      `${noaaConfig.metadata.apiBaseUrl}/points/${location.lat},${location.lon}`,
      { headers }
    );
    if (!pointsResponse.ok) {
      throw new Error(`NOAA points lookup failed with ${pointsResponse.status}`);
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties.forecast;
    const forecastGridUrl = pointsData.properties.forecastGridData;

    const [forecastResponse, forecastGridResponse] = await Promise.all([
      fetch(forecastUrl, { headers }),
      fetch(forecastGridUrl, { headers })
    ]);

    if (!forecastResponse.ok || !forecastGridResponse.ok) {
      throw new Error("NOAA forecast fetch failed");
    }

    const forecastData = await forecastResponse.json();
    const forecastGridData = await forecastGridResponse.json();
    const periods = forecastData.properties?.periods || [];
    const snowfallValues = forecastGridData.properties?.snowfallAmount?.values || [];
    const snow72Hours = sumSnowfallValuesForNext72Hours(snowfallValues);

    return {
      label: noaaConfig.metadata.label,
      forecastUrl,
      forecastOffice: pointsData.properties?.forecastOffice || null,
      gridId: pointsData.properties?.gridId || null,
      gridX: pointsData.properties?.gridX || null,
      gridY: pointsData.properties?.gridY || null,
      snowfall72Hours: snow72Hours === null ? null : Number(snow72Hours.toFixed(1)),
      summary: shortenForecastText(periods),
      updatedAt: periods[0]?.startTime || "NOAA forecast"
    };
  }

  async function loadNoaaForecasts() {
    const entries = Object.entries(noaaConfig.resorts || {});
    await Promise.all(
      entries.map(async ([resortId, location]) => {
        try {
          const forecast = await fetchNoaaForecast(resortId, location);
          state.noaaForecasts[resortId] = forecast;
        }
        catch (error) {
          state.noaaForecasts[resortId] = {
            error: error.message
          };
        }
      })
    );
    applyFilters();
  }

  async function fetchGlobalForecast(resortId, location) {
    const params = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      hourly: "snowfall",
      forecast_hours: "72",
      timezone: "auto"
    });
    const response = await fetch(`${globalForecastConfig.metadata.apiBaseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Global forecast lookup failed with ${response.status}`);
    }

    const data = await response.json();
    const snowfall = data.hourly?.snowfall || [];
    const times = data.hourly?.time || [];
    if (!snowfall.length) {
      return {
        label: globalForecastConfig.metadata.label,
        snowfall72Hours: null,
        summary: "Open-Meteo did not return hourly snowfall for this location.",
        updatedAt: data.generationtime_ms ? "Open-Meteo forecast" : null
      };
    }

    const total = snowfall.reduce((sum, value) => sum + Number(value || 0), 0);
    return {
      label: globalForecastConfig.metadata.label,
      forecastUrl: `${globalForecastConfig.metadata.docsUrl}`,
      snowfall72Hours: Number(total.toFixed(1)),
      summary: `Open-Meteo hourly snowfall forecast over the next 72 hours beginning ${times[0] || "now"}.`,
      updatedAt: "Open-Meteo forecast"
    };
  }

  async function loadGlobalForecasts() {
    const entries = Object.entries(globalForecastConfig.resorts || {});
    await Promise.all(
      entries.map(async ([resortId, location]) => {
        try {
          const forecast = await fetchGlobalForecast(resortId, location);
          state.globalForecasts[resortId] = forecast;
        }
        catch (error) {
          state.globalForecasts[resortId] = {
            error: error.message
          };
        }
      })
    );
    applyFilters();
  }

  function terrainPercent(resort) {
    if (resort.trailsOpen === null || resort.trailsTotal === null) {
      return Number.NEGATIVE_INFINITY;
    }
    return resort.trailsOpen / resort.trailsTotal;
  }

  function getForecastSnowValue(resort) {
    const noaa = state.noaaForecasts[resort.id];
    const globalForecast = state.globalForecasts[resort.id];
    const forecastData = noaaConfig.resorts[resort.id] ? noaa : globalForecast;
    if (!forecastData || forecastData.error) {
      return Number.NEGATIVE_INFINITY;
    }
    return numericOrNegativeInfinity(forecastData.snowfall72Hours);
  }

  function latestFreshnessHours(label) {
    if (!label) {
      return Number.POSITIVE_INFINITY;
    }
    const hourMatch = label.match(/(\d+)\s+hours?/i);
    if (hourMatch) {
      return Number(hourMatch[1]);
    }
    const dayMatch = label.match(/(\d+)\s+day/i);
    if (dayMatch) {
      return Number(dayMatch[1]) * 24;
    }
    return Number.POSITIVE_INFINITY;
  }

  function buildOptions(select, values) {
    select.innerHTML = values
      .map((value) => `<option value="${value}">${value}</option>`)
      .join("");
  }

  function renderSummary(filteredResorts) {
    const resortsWithData = filteredResorts.filter(
      (resort) =>
        resort.snowfall72Hours !== null ||
        resort.snowfall7Days !== null ||
        resort.snowfall24Hours !== null ||
        resort.baseDepthMin !== null
    );
    const bestSnow = [...resortsWithData].sort((left, right) => {
      const rightValue =
        numericOrNegativeInfinity(right.snowfall7Days) > Number.NEGATIVE_INFINITY
          ? numericOrNegativeInfinity(right.snowfall7Days)
          : numericOrNegativeInfinity(right.snowfall24Hours) > Number.NEGATIVE_INFINITY
            ? numericOrNegativeInfinity(right.snowfall24Hours)
            : numericOrNegativeInfinity(right.snowfall72Hours);
      const leftValue =
        numericOrNegativeInfinity(left.snowfall7Days) > Number.NEGATIVE_INFINITY
          ? numericOrNegativeInfinity(left.snowfall7Days)
          : numericOrNegativeInfinity(left.snowfall24Hours) > Number.NEGATIVE_INFINITY
            ? numericOrNegativeInfinity(left.snowfall24Hours)
            : numericOrNegativeInfinity(left.snowfall72Hours);
      return rightValue - leftValue;
    })[0];
    const deepestBase = [...resortsWithData].sort(
      (left, right) =>
        numericOrNegativeInfinity(right.baseDepthMax) -
        numericOrNegativeInfinity(left.baseDepthMax)
    )[0];
    const mostOpen = [...filteredResorts].sort(
      (left, right) => terrainPercent(right) - terrainPercent(left)
    )[0];
    const officialCount = filteredResorts.filter((resort) => resort.sourceLabel === "OnTheSnow snow report").length;

    const cards = [
      {
        label: "Destinations",
        value: filteredResorts.length,
        detail: `${officialCount} in this view are currently using OnTheSnow-backed stats`
      },
      {
        label: "Deepest Base",
        value: deepestBase ? formatBaseDepth(deepestBase) : "N/A",
        detail: deepestBase ? deepestBase.name : "No base data in current filter"
      },
      {
        label: "Best Fresh Snow",
        value: bestSnow
          ? formatInches(
              bestSnow.snowfall7Days ??
                bestSnow.snowfall24Hours ??
                bestSnow.snowfall72Hours
            )
          : "N/A",
        detail: bestSnow
          ? bestSnow.snowfall7Days !== null
            ? `${bestSnow.name} by available 7-day total`
            : bestSnow.snowfall24Hours !== null
              ? `${bestSnow.name} by available 24h total`
              : `${bestSnow.name} by available 72h total`
          : "No snowfall data in current filter"
      },
      {
        label: "Most Terrain Open",
        value: mostOpen ? formatPercent(mostOpen.trailsOpen, mostOpen.trailsTotal) : "N/A",
        detail: mostOpen ? mostOpen.name : "No terrain coverage in current filter"
      }
    ];

    summaryGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="summary-card">
            <span>${card.label}</span>
            <strong>${card.value}</strong>
            <p>${card.detail}</p>
          </article>
        `
      )
      .join("");
  }

  function makeStatusTag(status) {
    const normalized = status.toLowerCase();
    const className =
      normalized === "open" ? "live" : normalized === "closed" ? "closed" : "preseason";
    return `<span class="tag ${className}">${status}</span>`;
  }

  function makeSourceTag(resort) {
    if (resort.sourceLabel === "OnTheSnow snow report") {
      return `<span class="tag source official">OnTheSnow</span>`;
    }
    if (resort.sourceType === "official-link") {
      return `<span class="tag source linked">Linked source</span>`;
    }
    return `<span class="tag source fallback">Refresh overlay</span>`;
  }

  function renderResorts(filteredResorts) {
    if (!filteredResorts.length) {
      resortGrid.innerHTML = `
        <div class="empty-state">
          <h3>No destinations matched those filters.</h3>
          <p>Try clearing the search or broadening the status and region filters.</p>
        </div>
      `;
      return;
    }

    resortGrid.innerHTML = filteredResorts
      .map((resort) => {
        const noaa = state.noaaForecasts[resort.id];
        const globalForecast = state.globalForecasts[resort.id];
        const countryFlagCode = getCountryFlagCode(resort.country);
        const countryFlagImage = countryFlagCode
          ? `<img class="country-flag" src="https://flagcdn.com/24x18/${countryFlagCode}.png" alt="${resort.country} flag" loading="lazy" />`
          : "";
        const resortImageUrl = getResortImageUrl(resort);
        const continent = getContinent(resort.country);
        const subtitleText = continent || resort.region;
        const terrainPercentLabel = formatPercent(resort.trailsOpen, resort.trailsTotal);
        const liftPercentLabel = formatPercent(resort.liftsOpen, resort.liftsTotal);
        const subResortText = resort.subResorts.length
          ? `<span class="tag">${resort.subResorts.join(" / ")}</span>`
          : "";
        const forecastSource = noaaConfig.resorts[resort.id]
          ? "NOAA"
          : globalForecastConfig.resorts[resort.id]
            ? "Open-Meteo"
            : null;
        const forecastData = noaaConfig.resorts[resort.id] ? noaa : globalForecast;
        const forecastSnowLabel = forecastSource
          ? forecastData?.error
            ? `${forecastSource} error`
            : forecastData?.snowfall72Hours !== undefined
              ? formatInches(forecastData.snowfall72Hours)
              : `Loading ${forecastSource}...`
          : "Forecast unavailable";
        const forecastSummary = forecastSource
          ? forecastData?.error
            ? `Unable to load ${forecastSource} forecast for this resort right now.`
            : forecastData?.summary || `Fetching ${forecastSource} forecast...`
          : "No forecast source configured for this resort.";
        const forecastLink = noaaConfig.resorts[resort.id]
          ? `
              <a href="${getNoaaForecastPageUrl(noaaConfig.resorts[resort.id])}" target="_blank" rel="noreferrer">NOAA 3-day forecast</a>
            `
          : globalForecastConfig.resorts[resort.id]
            ? `
              <a href="${globalForecastConfig.metadata.docsUrl}" target="_blank" rel="noreferrer">Open-Meteo 72h forecast</a>
            `
          : "";
        const featuredSnow = getFeaturedSnowMetric(resort);
        return `
          <article class="resort-card">
            <div class="resort-image-wrap">
              <img class="resort-image" src="${resortImageUrl}" alt="${resort.name} mountain view" loading="lazy" onerror="this.onerror=null;this.src='./images/resorts/placeholder.svg';" />
            </div>
            <div class="resort-header">
              <div>
                <h3>${resort.name}</h3>
                <p class="resort-subtitle">${countryFlagImage}${subtitleText}</p>
              </div>
              <div class="tag-cluster">
                ${makeStatusTag(resort.status)}
                ${makeSourceTag(resort)}
                ${subResortText}
              </div>
            </div>

            <div class="metric-grid">
              <div class="metric">
                <span>${featuredSnow.label}</span>
                <strong>${formatInches(featuredSnow.value)}</strong>
                <small>${featuredSnow.note}</small>
              </div>
              <div class="metric">
                <span>72h forecast snow</span>
                <strong>${forecastSnowLabel}</strong>
                <small>${forecastSummary}</small>
              </div>
              <div class="metric">
                <span>Base depth</span>
                <strong>${formatBaseDepth(resort)}</strong>
                <small>${resort.condition || "Surface condition not reported in the active source."}</small>
              </div>
              <div class="metric">
                <span>Last updated</span>
                <strong>${resort.sourceUpdatedAt}</strong>
                <small>${resort.sourceNotes}</small>
              </div>
            </div>

            <dl class="mini-list">
              <div class="mini-item">
                <dt>Trails</dt>
                <dd>${formatRatio(resort.trailsOpen, resort.trailsTotal)}</dd>
              </div>
              <div class="mini-item">
                <dt>Terrain Open</dt>
                <dd>${terrainPercentLabel}</dd>
              </div>
              <div class="mini-item">
                <dt>Lifts</dt>
                <dd>${formatRatio(resort.liftsOpen, resort.liftsTotal)}</dd>
              </div>
              <div class="mini-item">
                <dt>Lifts Open</dt>
                <dd>${liftPercentLabel}</dd>
              </div>
              <div class="mini-item">
                <dt>7 Day Snow</dt>
                <dd>${formatInches(resort.snowfall7Days)}</dd>
              </div>
              <div class="mini-item">
                <dt>Season Snow</dt>
                <dd>${formatInches(resort.seasonSnowfall)}</dd>
              </div>
            </dl>

            <div class="source-links">
              <a href="${resort.resortReportUrl}" target="_blank" rel="noreferrer">Resort snow report</a>
              <a href="${resort.officialConditionsUrl}" target="_blank" rel="noreferrer">Resort homepage</a>
              ${forecastLink}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function applyFilters() {
    const searchNeedle = state.search.trim().toLowerCase();
    let filtered = enrichedResorts.filter((resort) => {
      const matchesStatus = state.status === "All" || resort.status === state.status;
      const matchesRegion = state.region === "All" || resort.region === state.region;
      const haystack = [
        resort.name,
        resort.country,
        resort.region,
        resort.hemisphere,
        resort.condition,
        resort.notes,
        resort.sourceNotes,
        ...(resort.subResorts || [])
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchNeedle || haystack.includes(searchNeedle);
      return matchesStatus && matchesRegion && matchesSearch;
    });

    filtered.sort((left, right) => {
      if (state.sort === "alphabetical") {
        return left.name.localeCompare(right.name);
      }
      if (state.sort === "base") {
        return (
          numericOrNegativeInfinity(right.baseDepthMax) -
          numericOrNegativeInfinity(left.baseDepthMax)
        );
      }
      if (state.sort === "terrain") {
        return terrainPercent(right) - terrainPercent(left);
      }
      if (state.sort === "updated") {
        return latestFreshnessHours(left.sourceUpdatedAt) - latestFreshnessHours(right.sourceUpdatedAt);
      }
      if (state.sort === "forecast") {
        return getForecastSnowValue(right) - getForecastSnowValue(left);
      }
      return (
        Math.max(
          numericOrNegativeInfinity(right.snowfall7Days),
          numericOrNegativeInfinity(right.snowfall24Hours),
          numericOrNegativeInfinity(right.snowfall72Hours)
        ) -
        Math.max(
          numericOrNegativeInfinity(left.snowfall7Days),
          numericOrNegativeInfinity(left.snowfall24Hours),
          numericOrNegativeInfinity(left.snowfall72Hours)
        )
      );
    });

    renderSummary(filtered);
    renderResorts(filtered);
    renderMapPins();
    renderMapDetail(state.selectedMapResortId);
  }

  function bindControls() {
    const statusValues = ["All", ...new Set(enrichedResorts.map((resort) => resort.status))];
    const regionValues = ["All", ...new Set(enrichedResorts.map((resort) => resort.region))];
    buildOptions(statusFilter, statusValues);
    buildOptions(regionFilter, regionValues);

    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      applyFilters();
    });

    statusFilter.addEventListener("change", (event) => {
      state.status = event.target.value;
      applyFilters();
    });

    regionFilter.addEventListener("change", (event) => {
      state.region = event.target.value;
      applyFilters();
    });

    sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      applyFilters();
    });

    if (pageArrowRight) {
      pageArrowRight.addEventListener("click", () => {
        scrollToPage(1);
      });
    }

    if (pageArrowLeft) {
      pageArrowLeft.addEventListener("click", () => {
        scrollToPage(0);
      });
    }

    if (pageRail) {
      pageRail.addEventListener("scroll", updatePageArrowState, { passive: true });
      window.addEventListener("resize", () => {
        updatePageArrowState();
        if (state.mapUserAdjusted) {
          applyMapTransform();
        } else {
          state.mapViewInitialized = false;
          renderMapPins();
        }
      });
    }
  }

  bindControls();
  applyFilters();
  updatePageArrowState();
  loadNoaaForecasts();
  loadGlobalForecasts();
})();
