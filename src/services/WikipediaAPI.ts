type WikipediaSummaryResponse = {
  title: string;
  extract: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
  thumbnail?: {
    source?: string;
  };
  originalimage?: {
    source?: string;
  };
  type?: string;
};

type WikipediaQueryPagesResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        extract?: string;
        pageprops?: {
          wikibase_item?: string;
        };
      }
    >;
  };
};

type WikidataEntityResponse = {
  entities?: Record<
    string,
    {
      labels?: Record<string, { value: string }>;
      claims?: Record<string, WikidataClaim[]>;
    }
  >;
};

type WikidataClaim = {
  mainsnak?: {
    datavalue?: {
      value?:
        | string
        | {
            id?: string;
            time?: string;
          };
    };
  };
};

export type WikipediaFact = {
  label: string;
  value: string;
  url?: string;
};

export type WikipediaTeamSummary = {
  title: string;
  extract: string;
  paragraphs: string[];
  pageUrl: string;
  imageUrl: string;
  facts: WikipediaFact[];
};

const WIKIPEDIA_LOCALES = ["vi", "en"];

const WIKIDATA_FACT_CONFIG = [
  { property: "P571", label: "Nam thanh lap" },
  { property: "P17", label: "Quoc gia" },
  { property: "P118", label: "Giai dau" },
  { property: "P115", label: "San van dong" },
  { property: "P286", label: "Huan luyen vien" },
  { property: "P1037", label: "Giam doc the thao" },
  { property: "P634", label: "Doi truong" },
  { property: "P127", label: "Chu so huu" },
  { property: "P856", label: "Website" },
] as const;

const teamTitleCandidates = (teamName: string) => {
  const normalized = teamName.trim();

  return [
    normalized,
    `${normalized} F.C.`,
    `${normalized} FC`,
    `${normalized} football club`,
  ];
};

const getFirstPage = (data: WikipediaQueryPagesResponse) => {
  const pages = data.query?.pages;

  if (!pages) {
    return null;
  }
  console.log(Object.values(pages)[0]);
  return Object.values(pages)[0] ?? null;
};

const formatWikiDate = (time?: string) => {
  if (!time) {
    return "";
  }

  const normalizedTime = time.replace(/^\+/, "").split("T")[0];
  const [year, month, day] = normalizedTime.split("-");

  if (!year) {
    return "";
  }

  if (month === "00" || !month) {
    return year;
  }

  if (day === "00" || !day) {
    return `${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
};

const fetchPageSummary = async (locale: string, title: string) => {
  const response = await fetch(
    `https://${locale}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikipediaSummaryResponse;

  if (data.type === "disambiguation" || !data.extract) {
    return null;
  }

  console.log(" WikipediaSummaryResponse:" + data);
  console.log(data);

  return {
    title: data.title,
    extract: data.extract,
    pageUrl: data.content_urls?.desktop?.page ?? "",
    imageUrl: data.originalimage?.source ?? data.thumbnail?.source ?? "",
  };
};

const fetchPageMetadata = async (locale: string, title: string) => {
  const response = await fetch(
    `https://${locale}.wikipedia.org/w/api.php?origin=*&action=query&prop=pageprops|extracts&explaintext=1&titles=${encodeURIComponent(
      title,
    )}&format=json`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikipediaQueryPagesResponse;
  console.log("WikipediaQueryPagesResponse" + data);
  console.log(data);
  return getFirstPage(data);
};

const fetchFullExtractParagraphs = async (locale: string, title: string) => {
  const response = await fetch(
    `https://${locale}.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(
      title,
    )}&format=json`,
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as WikipediaQueryPagesResponse;
  const extract = getFirstPage(data)?.extract ?? "";

  return extract
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 80)
    .slice(0, 4);
};

const fetchEntityLabels = async (ids: string[], locale: string) => {
  if (ids.length === 0) {
    return {};
  }

  const response = await fetch(
    `https://www.wikidata.org/w/api.php?origin=*&action=wbgetentities&ids=${ids.join(
      "|",
    )}&languages=${locale}|en&format=json`,
  );

  if (!response.ok) {
    return {};
  }

  const data = (await response.json()) as WikidataEntityResponse;
  const entities = data.entities ?? {};
  console.log("WikidataEntityResponse" + data);
  console.log(data);
  return Object.fromEntries(
    Object.entries(entities).map(([id, entity]) => [
      id,
      entity.labels?.[locale]?.value ?? entity.labels?.en?.value ?? id,
    ]),
  );
};

// Chuyển giá trị raw từ Wikidata claim thành string hiển thị được.
const resolveClaimValue = (
  claim: WikidataClaim | undefined,
  labelsById: Record<string, string>,
) => {
  const value = claim?.mainsnak?.datavalue?.value;

  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.id) {
    return labelsById[value.id] ?? value.id;
  }

  if (value.time) {
    return formatWikiDate(value.time);
  }

  return "";
};

const fetchWikidataFacts = async (wikibaseItem: string, locale: string) => {
  const response = await fetch(
    `https://www.wikidata.org/w/api.php?origin=*&action=wbgetentities&ids=${wikibaseItem}&languages=${locale}|en&format=json`,
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as WikidataEntityResponse;
  const entity = data.entities?.[wikibaseItem];
  console.log("WikidataEntityResponse");
  console.log(data);
  if (!entity?.claims) {
    return [];
  }

  //duyệt qua các property trong WIKIDATA_FACT_CONFIG
  // để lấy ra các id trong mainsnak(vd:"Q9448")
  const linkedIds = WIKIDATA_FACT_CONFIG.flatMap(({ property }) => {
    return (entity.claims?.[property] ?? [])
      .map((claim) => claim.mainsnak?.datavalue?.value)
      .filter(
        (value): value is { id: string } =>
          typeof value === "object" &&
          value !== null &&
          typeof value.id === "string",
      )
      .map((value) => value.id);
  });
  // linkedIds chứa danh sách ID mainsnak

  // Tạo danh sách sắp xếp các phần tử từ set và gán lạ thảnh mảng và chueyern vào tham số labelsById
  const labelsById = await fetchEntityLabels(
    Array.from(new Set(linkedIds)),
    locale,
  );

  return WIKIDATA_FACT_CONFIG.map(({ property, label }) => {
    const firstClaim = entity.claims?.[property]?.[0];
    console.log(firstClaim + "hehe");
    console.log(firstClaim);
    const value = resolveClaimValue(firstClaim, labelsById);
    console.log(value + "hehehe");
    console.log(value);
    if (!value) {
      return null;
    }

    const url =
      property === "P856" && /^https?:\/\//.test(value)
        ? value
        : property !== "P856" &&
            firstClaim?.mainsnak?.datavalue?.value &&
            typeof firstClaim.mainsnak.datavalue.value === "object" &&
            "id" in firstClaim.mainsnak.datavalue.value
          ? `https://www.wikidata.org/wiki/${firstClaim.mainsnak.datavalue.value.id}`
          : undefined;

    const fact: WikipediaFact = {
      label,
      value,
      url,
    };

    return fact;
  }).filter((fact) => fact !== null);
};

const buildTeamSummary = async (locale: string, title: string) => {
  const summary = await fetchPageSummary(locale, title);

  if (!summary) {
    return null;
  }

  const metadata = await fetchPageMetadata(locale, summary.title);
  const paragraphs = await fetchFullExtractParagraphs(locale, summary.title);
  const wikibaseItem = metadata?.pageprops?.wikibase_item;
  const facts = wikibaseItem
    ? await fetchWikidataFacts(wikibaseItem, locale)
    : [];

  return {
    ...summary,
    paragraphs:
      paragraphs.length > 0 ? paragraphs : [summary.extract].filter(Boolean),
    facts,
  } satisfies WikipediaTeamSummary;
};

const searchTeamPage = async (locale: string, teamName: string) => {
  const response = await fetch(
    `https://${locale}.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(
      `${teamName} football club`,
    )}&format=json`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    query?: {
      search?: Array<{
        title: string;
      }>;
    };
  };

  const firstResult = data.query?.search?.[0]?.title;

  if (!firstResult) {
    return null;
  }

  return buildTeamSummary(locale, firstResult);
};

export async function getWikipediaTeamSummary(teamName: string) {
  for (const locale of WIKIPEDIA_LOCALES) {
    for (const candidate of teamTitleCandidates(teamName)) {
      const summary = await buildTeamSummary(locale, candidate);

      if (summary) {
        return summary;
      }
    }

    const summaryFromSearch = await searchTeamPage(locale, teamName);

    if (summaryFromSearch) {
      return summaryFromSearch;
    }
  }

  throw new Error("Khong tim thay thong tin doi bong tren Wikipedia.");
}
