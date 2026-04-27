package pl.relay.activity.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.relay.activity.ActivitySyncWorker;
import pl.relay.activity.dto.SyncResponse;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSyncController {

    private final ActivitySyncWorker activitySyncWorker;

    @PostMapping("/sync")
    public SyncResponse syncActivities() {
        activitySyncWorker.syncActivities();
        return new SyncResponse("completed", "Activity synchronization finished.");
    }
}
