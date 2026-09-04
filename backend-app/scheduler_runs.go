package main

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

type SchedulerCounts struct {
	Received int
	Created  int
	Updated  int
	Failed   int
}

var schedulerCountsMu sync.Mutex
var schedulerCounts = map[string]SchedulerCounts{}

func setSchedulerCounts(job string, counts SchedulerCounts) {
	schedulerCountsMu.Lock()
	defer schedulerCountsMu.Unlock()
	schedulerCounts[job] = counts
}

func getSchedulerCounts(job string) SchedulerCounts {
	schedulerCountsMu.Lock()
	defer schedulerCountsMu.Unlock()
	return schedulerCounts[job]
}

func startSchedulerRun(jobName string) (*core.Record, time.Time) {
	started := time.Now()
	if pocketbaseApp == nil {
		return nil, started
	}
	runs, err := pocketbaseApp.FindCollectionByNameOrId("scheduler_runs")
	if err != nil {
		log.Println("Unable to load scheduler_runs collection:", err)
		return nil, started
	}
	record := core.NewRecord(runs)
	record.Set("job_name", jobName)
	record.Set("started_at", started.UTC().Format(time.RFC3339Nano))
	record.Set("status", "RUNNING")
	if err := pocketbaseApp.Save(record); err != nil {
		log.Println("Unable to save scheduler start:", err)
		return nil, started
	}
	return record, started
}

func finishSchedulerRun(record *core.Record, started time.Time, status string, errMessage string) {
	if pocketbaseApp == nil || record == nil {
		return
	}
	record.Set("completed_at", time.Now().UTC().Format(time.RFC3339Nano))
	record.Set("status", status)
	record.Set("error_message", errMessage)
	counts := getSchedulerCounts(record.GetString("job_name"))
	record.Set("records_received", counts.Received)
	record.Set("records_created", counts.Created)
	record.Set("records_updated", counts.Updated)
	record.Set("records_failed", counts.Failed)
	if err := pocketbaseApp.Save(record); err != nil {
		log.Println("Unable to save scheduler completion:", err)
	}
}

func recordSkippedSchedulerRun(jobName string, reason string) {
	record, started := startSchedulerRun(jobName)
	finishSchedulerRun(record, started, "SKIPPED", reason)
}

func runTrackedJob(name string, fn func()) {
	record, started := startSchedulerRun(name)
	defer func() {
		if recovered := recover(); recovered != nil {
			message := fmt.Sprintf("scheduler panic: %v", recovered)
			log.Println(message)
			finishSchedulerRun(record, started, "FAILED", message)
			return
		}
		finishSchedulerRun(record, started, "SUCCESS", "")
	}()
	fn()
}
