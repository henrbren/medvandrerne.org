<?php
/**
 * Admin page for managing activity messages
 * This file is included by index.php - do NOT add HTML document structure
 */

// Load activities
$activitiesFile = DATA_DIR . 'activities.json';
$activities = readJsonFile($activitiesFile, []);

// Load calendar events
$calendarCacheFile = DATA_DIR . 'calendar_cache.json';
$calendarEvents = readJsonFile($calendarCacheFile, []);

// Merge activities
$allActivities = array_merge($activities, $calendarEvents);

// Sort by date
usort($allActivities, function($a, $b) {
    return strcmp($a['date'] ?? '', $b['date'] ?? '');
});

// Filter to only future activities
$now = date('Y-m-d');
$futureActivities = array_filter($allActivities, function($a) use ($now) {
    return ($a['date'] ?? '') >= $now;
});

// Load messages
$messagesFile = DATA_DIR . 'activity_messages.json';
$allMessages = readJsonFile($messagesFile, []);

// Load registrations for counts
$registrationsFile = DATA_DIR . 'registrations.json';
$registrations = readJsonFile($registrationsFile, []);

// Handle form submission
$success = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'send_message') {
        $activityId = $_POST['activity_id'] ?? '';
        $title = trim($_POST['title'] ?? '');
        $message = trim($_POST['message'] ?? '');
        $priority = $_POST['priority'] ?? 'normal';
        $sendPush = isset($_POST['send_push']);
        
        if (empty($activityId) || empty($title) || empty($message)) {
            $error = 'Alle feltene må fylles ut';
        } else {
            // Save message
            if (!isset($allMessages[$activityId])) {
                $allMessages[$activityId] = [];
            }
            
            $messageId = 'msg_' . uniqid() . '_' . substr(md5(time() . $activityId), 0, 8);
            $timestamp = date('c');
            
            $newMessage = [
                'id' => $messageId,
                'activityId' => $activityId,
                'title' => $title,
                'message' => $message,
                'authorName' => 'Admin',
                'authorId' => 'admin',
                'priority' => $priority,
                'createdAt' => $timestamp,
                'readBy' => [],
            ];
            
            array_unshift($allMessages[$activityId], $newMessage);
            
            if (writeJsonFile($messagesFile, $allMessages)) {
                // Queue push notification if requested
                if ($sendPush) {
                    $pushQueueFile = DATA_DIR . 'push_queue.json';
                    $pushQueue = readJsonFile($pushQueueFile, []);
                    
                    $pushQueue[] = [
                        'id' => 'push_' . uniqid(),
                        'type' => 'activity_message',
                        'activityId' => $activityId,
                        'messageId' => $messageId,
                        'title' => $title,
                        'body' => mb_substr($message, 0, 100) . (mb_strlen($message) > 100 ? '...' : ''),
                        'priority' => $priority,
                        'createdAt' => $timestamp,
                        'processed' => false,
                    ];
                    
                    writeJsonFile($pushQueueFile, $pushQueue);
                }
                
                $participantCount = $registrations[$activityId]['count'] ?? 0;
                $success = "Melding sendt til aktivitet! {$participantCount} deltaker" . ($participantCount !== 1 ? 'e' : '') . " vil motta den.";
            } else {
                $error = 'Kunne ikke lagre meldingen';
            }
        }
    } elseif ($action === 'delete_message') {
        $activityId = $_POST['activity_id'] ?? '';
        $messageId = $_POST['message_id'] ?? '';
        
        if (isset($allMessages[$activityId])) {
            foreach ($allMessages[$activityId] as $key => $msg) {
                if ($msg['id'] === $messageId) {
                    unset($allMessages[$activityId][$key]);
                    $allMessages[$activityId] = array_values($allMessages[$activityId]);
                    writeJsonFile($messagesFile, $allMessages);
                    $success = 'Melding slettet';
                    break;
                }
            }
        }
    } elseif ($action === 'process_push_queue') {
        // Process push notification queue
        $pushQueueFile = DATA_DIR . 'push_queue.json';
        $tokensFile = DATA_DIR . 'push_tokens.json';
        
        $pushQueue = readJsonFile($pushQueueFile, []);
        $allTokens = readJsonFile($tokensFile, []);
        
        $processedCount = 0;
        
        foreach ($pushQueue as &$notification) {
            if ($notification['processed']) continue;
            
            $activityId = $notification['activityId'];
            
            // Get participants
            $targetUserIds = [];
            if (isset($registrations[$activityId])) {
                foreach ($registrations[$activityId]['participants'] as $p) {
                    $targetUserIds[] = $p['userId'];
                }
            }
            
            if (empty($targetUserIds)) {
                $notification['processed'] = true;
                $notification['processedAt'] = date('c');
                $notification['result'] = 'No participants';
                $processedCount++;
                continue;
            }
            
            // Collect tokens
            $pushTokens = [];
            foreach ($targetUserIds as $uid) {
                if (isset($allTokens[$uid])) {
                    foreach ($allTokens[$uid] as $t) {
                        if (strpos($t['token'], 'ExponentPushToken') === 0) {
                            $pushTokens[] = $t['token'];
                        }
                    }
                }
            }
            
            $pushTokens = array_unique($pushTokens);
            
            if (empty($pushTokens)) {
                $notification['processed'] = true;
                $notification['processedAt'] = date('c');
                $notification['result'] = 'No push tokens';
                $processedCount++;
                continue;
            }
            
            // Send via Expo
            $messages = [];
            foreach ($pushTokens as $token) {
                $messages[] = [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => $notification['title'],
                    'body' => $notification['body'],
                    'data' => [
                        'type' => 'activity_message',
                        'activityId' => $activityId,
                        'messageId' => $notification['messageId'] ?? null,
                    ],
                ];
            }
            
            $ch = curl_init('https://exp.host/--/api/v2/push/send');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    'Accept: application/json',
                    'Content-Type: application/json',
                ],
                CURLOPT_POSTFIELDS => json_encode($messages),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            $notification['processed'] = true;
            $notification['processedAt'] = date('c');
            $notification['result'] = ['httpCode' => $httpCode, 'sentTo' => count($pushTokens)];
            $processedCount++;
        }
        
        writeJsonFile($pushQueueFile, $pushQueue);
        $success = "Prosessert {$processedCount} push-varsel" . ($processedCount !== 1 ? 'er' : '');
    }
}

// Re-load messages after any changes
$allMessages = readJsonFile($messagesFile, []);

// Count pending push notifications
$pushQueueFile = DATA_DIR . 'push_queue.json';
$pushQueue = readJsonFile($pushQueueFile, []);
$pendingPushCount = count(array_filter($pushQueue, function($n) { return !$n['processed']; }));

?>

<style>
    .messages-page {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
    }
    
    @media (max-width: 1200px) {
        .messages-page {
            grid-template-columns: 1fr;
        }
    }
    
    .message-form-card {
        background: var(--bg-elevated);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        overflow: hidden;
    }
    
    .message-form-card h3 {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-5) var(--space-6);
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-subtle);
        margin: 0;
    }
    
    .message-form-content {
        padding: var(--space-6);
    }
    
    .priority-options {
        display: flex;
        gap: var(--space-3);
    }
    
    .priority-option {
        flex: 1;
        padding: var(--space-4);
        border: 2px solid var(--border-default);
        border-radius: var(--radius-md);
        text-align: center;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
        background: var(--bg-base);
    }
    
    .priority-option:hover {
        border-color: var(--brand);
    }
    
    .priority-option.selected {
        border-color: var(--brand);
        background: rgba(229, 57, 53, 0.1);
    }
    
    .priority-option.selected.important {
        border-color: var(--warning);
        background: rgba(255, 179, 0, 0.1);
    }
    
    .priority-option.selected.urgent {
        border-color: var(--error);
        background: rgba(255, 23, 68, 0.1);
    }
    
    .priority-option .icon {
        font-size: 1.5rem;
        margin-bottom: var(--space-2);
    }
    
    .priority-option .label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .checkbox-label input {
        width: 18px;
        height: 18px;
        accent-color: var(--brand);
    }
    
    .sent-messages-card {
        background: var(--bg-elevated);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        overflow: hidden;
    }
    
    .sent-messages-card h3 {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-5) var(--space-6);
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-subtle);
        margin: 0;
    }
    
    .messages-list {
        max-height: 600px;
        overflow-y: auto;
    }
    
    .activity-group {
        border-bottom: 1px solid var(--border-subtle);
    }
    
    .activity-group:last-child {
        border-bottom: none;
    }
    
    .activity-group-header {
        padding: var(--space-4) var(--space-6);
        background: var(--bg-subtle);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .activity-group-header h4 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .activity-group-header .meta {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .message-item {
        padding: var(--space-4) var(--space-6);
        border-top: 1px solid var(--border-subtle);
    }
    
    .message-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-2);
    }
    
    .message-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
    }
    
    .message-priority {
        display: inline-flex;
        align-items: center;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .message-priority.normal {
        background: rgba(41, 121, 255, 0.15);
        color: #1565C0;
    }
    
    .message-priority.important {
        background: rgba(255, 179, 0, 0.15);
        color: #D4A000;
    }
    
    .message-priority.urgent {
        background: rgba(255, 23, 68, 0.15);
        color: #D50000;
    }
    
    .message-content {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: var(--space-3);
        white-space: pre-wrap;
    }
    
    .message-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .message-meta {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .delete-btn {
        padding: var(--space-1) var(--space-3);
        font-size: 0.75rem;
        background: transparent;
        border: 1px solid var(--error);
        color: var(--error);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--duration-fast);
    }
    
    .delete-btn:hover {
        background: var(--error);
        color: white;
    }
    
    .alert {
        padding: var(--space-4) var(--space-5);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-5);
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }
    
    .alert-success {
        background: rgba(0, 200, 83, 0.15);
        color: #00A854;
        border: 1px solid rgba(0, 200, 83, 0.3);
    }
    
    .alert-error {
        background: rgba(255, 23, 68, 0.15);
        color: #D50000;
        border: 1px solid rgba(255, 23, 68, 0.3);
    }
    
    .alert-warning {
        background: rgba(255, 179, 0, 0.15);
        color: #D4A000;
        border: 1px solid rgba(255, 179, 0, 0.3);
    }
    
    .push-queue-alert {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .push-queue-alert form {
        margin: 0;
    }
    
    .empty-state {
        padding: var(--space-10);
        text-align: center;
        color: var(--text-muted);
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: var(--space-4);
        opacity: 0.5;
    }
    
    .empty-state p {
        margin: 0;
    }
</style>

<?php if ($success): ?>
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i>
    <?= htmlspecialchars($success) ?>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="alert alert-error">
    <i class="fas fa-exclamation-circle"></i>
    <?= htmlspecialchars($error) ?>
</div>
<?php endif; ?>

<?php if ($pendingPushCount > 0): ?>
<div class="alert alert-warning push-queue-alert">
    <div>
        <i class="fas fa-bell"></i>
        <?= $pendingPushCount ?> push-varsel venter på å bli sendt
    </div>
    <form method="POST">
        <input type="hidden" name="action" value="process_push_queue">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> Send nå
        </button>
    </form>
</div>
<?php endif; ?>

<div class="messages-page">
    <!-- Send Message Form -->
    <div class="message-form-card">
        <h3><i class="fas fa-paper-plane"></i> Send ny melding</h3>
        <div class="message-form-content">
            <form method="POST">
                <input type="hidden" name="action" value="send_message">
                
                <div class="form-group">
                    <label for="activity_id">Velg aktivitet</label>
                    <select name="activity_id" id="activity_id" required>
                        <option value="">-- Velg aktivitet --</option>
                        <?php foreach ($futureActivities as $activity): ?>
                        <?php 
                            $activityId = (string)$activity['id'];
                            $participantCount = $registrations[$activityId]['count'] ?? 0;
                        ?>
                        <option value="<?= htmlspecialchars($activityId) ?>">
                            <?= htmlspecialchars($activity['title']) ?> 
                            (<?= htmlspecialchars($activity['date']) ?>) 
                            - <?= $participantCount ?> påmeldt<?= $participantCount !== 1 ? 'e' : '' ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="title">Tittel</label>
                    <input type="text" name="title" id="title" placeholder="F.eks. Viktig info om oppmøte" required>
                </div>
                
                <div class="form-group">
                    <label for="message">Melding</label>
                    <textarea name="message" id="message" placeholder="Skriv meldingen her..." required></textarea>
                </div>
                
                <div class="form-group">
                    <label>Prioritet</label>
                    <div class="priority-options">
                        <label class="priority-option selected" data-priority="normal">
                            <input type="radio" name="priority" value="normal" checked hidden>
                            <div class="icon">ℹ️</div>
                            <div class="label">Normal</div>
                        </label>
                        <label class="priority-option" data-priority="important">
                            <input type="radio" name="priority" value="important" hidden>
                            <div class="icon">⚠️</div>
                            <div class="label">Viktig</div>
                        </label>
                        <label class="priority-option" data-priority="urgent">
                            <input type="radio" name="priority" value="urgent" hidden>
                            <div class="icon">🚨</div>
                            <div class="label">Haster</div>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="send_push" checked>
                        Send push-varsel til påmeldte
                    </label>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="fas fa-paper-plane"></i> Send melding
                </button>
            </form>
        </div>
    </div>

    <!-- Sent Messages -->
    <div class="sent-messages-card">
        <h3><i class="fas fa-inbox"></i> Sendte meldinger</h3>
        <div class="messages-list">
            <?php 
            $hasMessages = false;
            foreach ($futureActivities as $activity): 
                $activityId = (string)$activity['id'];
                $activityMessages = $allMessages[$activityId] ?? [];
                if (empty($activityMessages)) continue;
                $hasMessages = true;
            ?>
            <div class="activity-group">
                <div class="activity-group-header">
                    <h4><?= htmlspecialchars($activity['title']) ?></h4>
                    <span class="meta"><?= htmlspecialchars($activity['date']) ?> • <?= count($activityMessages) ?> melding<?= count($activityMessages) !== 1 ? 'er' : '' ?></span>
                </div>
                <?php foreach ($activityMessages as $msg): ?>
                <div class="message-item">
                    <div class="message-item-header">
                        <span class="message-title"><?= htmlspecialchars($msg['title']) ?></span>
                        <span class="message-priority <?= $msg['priority'] ?>">
                            <?php
                            switch ($msg['priority']) {
                                case 'urgent': echo '🚨 Haster'; break;
                                case 'important': echo '⚠️ Viktig'; break;
                                default: echo 'ℹ️ Info';
                            }
                            ?>
                        </span>
                    </div>
                    <div class="message-content"><?= nl2br(htmlspecialchars($msg['message'])) ?></div>
                    <div class="message-footer">
                        <span class="message-meta">
                            Sendt <?= date('d.m.Y H:i', strtotime($msg['createdAt'])) ?> av <?= htmlspecialchars($msg['authorName']) ?>
                        </span>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="delete_message">
                            <input type="hidden" name="activity_id" value="<?= htmlspecialchars($activityId) ?>">
                            <input type="hidden" name="message_id" value="<?= htmlspecialchars($msg['id']) ?>">
                            <button type="submit" class="delete-btn" onclick="return confirm('Er du sikker på at du vil slette denne meldingen?')">
                                <i class="fas fa-trash"></i> Slett
                            </button>
                        </form>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endforeach; ?>
            
            <?php if (!$hasMessages): ?>
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Ingen meldinger sendt ennå</p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
document.querySelectorAll('.priority-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.priority-option').forEach(o => {
            o.classList.remove('selected', 'important', 'urgent');
        });
        this.classList.add('selected');
        const priority = this.dataset.priority;
        if (priority === 'important') this.classList.add('important');
        if (priority === 'urgent') this.classList.add('urgent');
        this.querySelector('input').checked = true;
    });
});
</script>
