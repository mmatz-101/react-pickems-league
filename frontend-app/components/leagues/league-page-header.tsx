"use client";

export default function LeaguePageHeader({
  league,
  leagues,
}: {
  league: { name: string; slug: string };
  leagues: { name: string; slug: string }[];
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <select
        aria-label="Select league"
        className="max-w-full cursor-pointer appearance-none bg-transparent pr-8 text-xl font-semibold outline-none"
        value={league.slug}
        onChange={(event) => {
          window.location.href = `/user/leagues/${event.target.value}/dashboard`;
        }}
      >
        {leagues.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name} Dashboard
          </option>
        ))}
      </select>
    </div>
  );
}
