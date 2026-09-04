// Stores scheduler execution history for operational visibility. Scheduler
// writes are performed internally by the embedded PocketBase app.

migrate(
  (app) => {
    const runs = new Collection({
      type: "base",
      name: "scheduler_runs",
      listRule: "@request.auth.platform_role = 'PLATFORM_ADMIN'",
      viewRule: "@request.auth.platform_role = 'PLATFORM_ADMIN'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "job_name", type: "text", required: true, max: 100 },
        { name: "started_at", type: "date" },
        { name: "completed_at", type: "date" },
        { name: "status", type: "select", required: true, values: ["RUNNING", "SUCCESS", "FAILED", "SKIPPED"], maxSelect: 1 },
        { name: "records_received", type: "number", noDecimal: true },
        { name: "records_created", type: "number", noDecimal: true },
        { name: "records_updated", type: "number", noDecimal: true },
        { name: "records_failed", type: "number", noDecimal: true },
        { name: "error_message", type: "text", max: 4000 },
      ],
      indexes: [
        "CREATE INDEX idx_scheduler_runs_job_started ON scheduler_runs (job_name, started_at)",
        "CREATE INDEX idx_scheduler_runs_status ON scheduler_runs (status)",
      ],
    });
    app.save(runs);
  },

  (app) => {
    app.delete(app.findCollectionByNameOrId("scheduler_runs"));
  }
);
