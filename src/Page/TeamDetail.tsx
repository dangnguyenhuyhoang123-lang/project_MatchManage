import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getWikipediaTeamSummary,
  type WikipediaFact,
  type WikipediaTeamSummary,
} from "../services/WikipediaAPI";
import ButtonLink from "../components/Button/ButtonLink";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";

const TeamDetail = () => {
  const { teamName } = useParams();
  const [searchParams] = useSearchParams();
  const [wikiData, setWikiData] = useState<WikipediaTeamSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const decodedTeamName = teamName
    ? decodeURIComponent(teamName)
    : "Unknown Team";
  const fallbackLogo = searchParams.get("logo") || "/default.png";
  const fallbackLeagueName = searchParams.get("league") || "Football Club";
  const fallbackStadiumName = searchParams.get("stadium") || "Dang cap nhat";

  useEffect(() => {
    let isMounted = true;

    const fetchTeamSummary = async () => {
      if (!teamName) {
        setError("Khong xac dinh duoc doi bong.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await getWikipediaTeamSummary(decodedTeamName);

        if (isMounted) {
          setWikiData(data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setWikiData(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Khong the tai thong tin Wikipedia.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTeamSummary();

    return () => {
      isMounted = false;
    };
  }, [decodedTeamName, teamName]);

  const facts = useMemo(() => {
    const factMap = new Map<string, WikipediaFact>();

    wikiData?.facts.forEach((fact) => {
      factMap.set(fact.label, fact);
    });

    if (!factMap.has("Giai dau") && fallbackLeagueName) {
      factMap.set("Giai dau", { label: "Giai dau", value: fallbackLeagueName });
    }

    if (!factMap.has("San van dong") && fallbackStadiumName) {
      factMap.set("San van dong", {
        label: "San van dong",
        value: fallbackStadiumName,
      });
    }

    return Array.from(factMap.values());
  }, [fallbackLeagueName, fallbackStadiumName, wikiData?.facts]);

  const featuredFacts = facts.slice(0, 6);
  const officialSite = facts.find((fact) => fact.label === "Website");
  const displayTitle = wikiData?.title || decodedTeamName;
  const displayLeague =
    facts.find((fact) => fact.label === "Giai dau")?.value ||
    fallbackLeagueName;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <ButtonLink
          label="Quay ve trang chu"
          to="/"
          className="mb-6 border border-emerald-200 bg-white text-emerald-700 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        />

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-800 via-emerald-600 to-lime-500 px-8 py-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <img
                  src={wikiData?.imageUrl || fallbackLogo}
                  alt={decodedTeamName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white object-contain p-3 shadow-lg"
                />

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-green-100 mb-2">
                    Team Profile
                  </p>
                  <h1 className="text-3xl md:text-5xl font-bold mb-3">
                    {displayTitle}
                  </h1>
                  <p className="text-lg text-green-50">{displayLeague}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
                {featuredFacts.slice(0, 4).map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-green-100 mb-1">
                      {fact.label}
                    </p>
                    <p className="font-semibold text-sm leading-6">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-8 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Thong tin doi bong
                </h2>

                {isLoading && (
                  <LoadingSpinner message="Dang tai thong tin doi bong" />
                )}

                {!isLoading && error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                    <p className="font-semibold mb-2">
                      Chua tim thay du lieu doi bong
                    </p>
                    <p>{error}</p>
                  </div>
                )}

                {!isLoading && !error && wikiData && (
                  <div className="space-y-4">
                    {wikiData.paragraphs.map((paragraph, index) => (
                      <p key={index} className="text-slate-700 leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {!isLoading && !error && facts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Thong tin chi tiet
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {facts.map((fact) => (
                      <div
                        key={`${fact.label}-${fact.value}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <p className="text-sm text-slate-500 mb-2">
                          {fact.label}
                        </p>
                        {fact.url ? (
                          <a
                            href={fact.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-green-700 hover:underline break-all"
                          >
                            {fact.value}
                          </a>
                        ) : (
                          <p className="font-semibold text-slate-800">
                            {fact.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                <h3 className="font-semibold text-lg mb-4">Thong tin nhanh</h3>

                <div className="space-y-3 text-slate-700">
                  <div>
                    <p className="text-sm text-slate-500">Ten doi</p>
                    <p className="font-medium">{displayTitle}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Giai dau</p>
                    <p className="font-medium">{displayLeague}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">San nha</p>
                    <p className="font-medium">
                      {facts.find((fact) => fact.label === "San van dong")
                        ?.value || fallbackStadiumName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Nam thanh lap</p>
                    <p className="font-medium">
                      {facts.find((fact) => fact.label === "Nam thanh lap")
                        ?.value || "Dang cap nhat"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 text-white p-5">
                <h3 className="font-semibold text-lg mb-3">Lien ket ngoai</h3>
                <div className="space-y-3">
                  {wikiData?.pageUrl && (
                    <a
                      href={wikiData.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
                    >
                      Wikipedia
                    </a>
                  )}

                  {officialSite?.url && (
                    <a
                      href={officialSite.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
                    >
                      Website chinh thuc
                    </a>
                  )}

                  <Link
                    to="/"
                    className="block rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
                  >
                    Xem them cac tran dau
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
