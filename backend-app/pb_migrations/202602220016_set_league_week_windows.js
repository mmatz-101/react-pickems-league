// Sets the historical OG Pickems competition windows. These are league
// weeks, not the NFL/NCAAF provider weeks stored on games.week.

migrate(
  (app) => {
    const weeks = app.findCollectionByNameOrId("weeks");
    const recordsByNumber = {};

    for (const week of app.findAllRecords(weeks)) {
      recordsByNumber[week.getInt("number")] = week;
    }

    const formatDate = (date) => date.toISOString().replace("T", " ");
    const day = 24 * 60 * 60 * 1000;
    const firstStart = new Date("2025-08-19T00:00:00.000Z");
    const firstEnd = new Date("2025-09-02T00:00:00.000Z");

    for (let number = 1; number <= 19; number++) {
      const week = recordsByNumber[number];
      if (!week) throw new Error(`Missing league week ${number}.`);

      const start = number === 1
        ? firstStart
        : new Date(firstEnd.getTime() + (number - 2) * 7 * day);
      const end = number === 1
        ? firstEnd
        : new Date(start.getTime() + 7 * day);

      week.set("start_date", formatDate(start));
      week.set("end_date", formatDate(end));
      app.save(week);
    }
  },

  (app) => {
    throw new Error("Historical league-week windows require an explicit rollback plan.");
  }
);
