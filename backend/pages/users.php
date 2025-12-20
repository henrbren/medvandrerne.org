<?php
/**
 * Admin Dashboard - Users Page
 */
$users = readJsonFile(JSON_USERS, []);

// Calculate stats
$totalUsers = count($users);
$activeUsers = count(array_filter($users, function($u) {
    return strtotime($u['lastActive'] ?? '1970-01-01') > strtotime('-30 days');
}));
$newUsers = count(array_filter($users, function($u) {
    return strtotime($u['createdAt'] ?? '1970-01-01') > strtotime('-7 days');
}));

// Level distribution
$levelDistribution = [];
foreach ($users as $user) {
    $level = $user['level'] ?? 1;
    $levelDistribution[$level] = ($levelDistribution[$level] ?? 0) + 1;
}
?>

<div class="page-header">
    <div class="page-header-content">
        <h1><i class="fas fa-users"></i> Brukere</h1>
        <p>Administrer registrerte brukere og se statistikk</p>
    </div>
</div>

<!-- Stats Cards -->
<div class="stats-grid" style="margin-bottom: var(--space-6);">
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary), var(--primary-light));">
            <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= $totalUsers ?>"><?= $totalUsers ?></span>
            <span class="stat-label">Totalt brukere</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--success), #4AE85C);">
            <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= $activeUsers ?>"><?= $activeUsers ?></span>
            <span class="stat-label">Aktive (30 dager)</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--info), #5AC8FA);">
            <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= $newUsers ?>"><?= $newUsers ?></span>
            <span class="stat-label">Nye (7 dager)</span>
        </div>
    </div>
</div>

<!-- Users Table -->
<div class="content-card">
    <div class="card-header">
        <h2><i class="fas fa-list"></i> Brukeroversikt</h2>
        <div class="header-actions">
            <input type="text" id="userSearch" placeholder="Søk etter navn eller telefon..." 
                   class="form-input" style="width: 250px;">
        </div>
    </div>
    
    <div class="table-container">
        <table class="data-table" id="usersTable">
            <thead>
                <tr>
                    <th>Bruker</th>
                    <th>Telefon</th>
                    <th>Nivå</th>
                    <th>Poeng</th>
                    <th>Aktiviteter</th>
                    <th>Medlem siden</th>
                    <th>Sist aktiv</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($users)): ?>
                <tr>
                    <td colspan="8" class="empty-message">
                        <i class="fas fa-user-slash"></i>
                        <p>Ingen brukere registrert ennå</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($users as $user): ?>
                <tr data-user-id="<?= htmlspecialchars($user['id']) ?>">
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar">
                                <?= strtoupper(substr($user['name'] ?: 'U', 0, 1)) ?>
                            </div>
                            <div class="user-info">
                                <span class="user-name"><?= htmlspecialchars($user['name'] ?: 'Ikke oppgitt') ?></span>
                                <span class="user-email"><?= htmlspecialchars($user['email'] ?: '-') ?></span>
                            </div>
                        </div>
                    </td>
                    <td><?= htmlspecialchars($user['phone']) ?></td>
                    <td>
                        <span class="level-badge level-<?= $user['level'] ?? 1 ?>">
                            <?= htmlspecialchars($user['levelName'] ?? 'Nybegynner') ?>
                        </span>
                    </td>
                    <td>
                        <span class="points-value"><?= number_format($user['totalPoints'] ?? 0) ?></span>
                    </td>
                    <td>
                        <span class="activity-count">
                            <i class="fas fa-check-circle"></i> <?= $user['completedActivities'] ?? 0 ?>
                        </span>
                    </td>
                    <td><?= date('d.m.Y', strtotime($user['memberSince'] ?? $user['createdAt'])) ?></td>
                    <td>
                        <span class="last-active <?= strtotime($user['lastActive'] ?? '1970-01-01') > strtotime('-7 days') ? 'recent' : '' ?>">
                            <?= date('d.m.Y', strtotime($user['lastActive'] ?? 'now')) ?>
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-icon btn-ghost" onclick="viewUser('<?= $user['id'] ?>')" title="Se detaljer">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-icon btn-ghost" onclick="deleteUser('<?= $user['id'] ?>')" title="Slett bruker">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- User Detail Modal -->
<div class="modal" id="userDetailModal">
    <div class="modal-backdrop" onclick="closeUserModal()"></div>
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h2><i class="fas fa-user"></i> Brukerdetaljer</h2>
            <button class="modal-close" onclick="closeUserModal()">&times;</button>
        </div>
        <div class="modal-body" id="userDetailContent">
            <!-- Content loaded dynamically -->
        </div>
    </div>
</div>

<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
}

.stat-card {
    background: var(--surface);
    border-radius: var(--radius-xl);
    padding: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    border: 1px solid var(--border);
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
}

.stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: var(--text);
}

.user-email {
    font-size: 12px;
    color: var(--text-secondary);
}

.level-badge {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;
}

.level-badge.level-1 { background: var(--background-elevated); color: var(--text-secondary); }
.level-badge.level-2 { background: #E3F2FD; color: #1565C0; }
.level-badge.level-3 { background: #E8F5E9; color: #2E7D32; }
.level-badge.level-4 { background: #FFF3E0; color: #EF6C00; }
.level-badge.level-5 { background: #FCE4EC; color: #C2185B; }

.points-value {
    font-weight: 600;
    color: var(--success);
}

.activity-count {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
}

.activity-count i {
    color: var(--success);
}

.last-active {
    color: var(--text-secondary);
}

.last-active.recent {
    color: var(--success);
    font-weight: 500;
}

.empty-message {
    text-align: center;
    padding: var(--space-8) !important;
    color: var(--text-secondary);
}

.empty-message i {
    font-size: 48px;
    margin-bottom: var(--space-3);
    opacity: 0.5;
}

.modal-lg {
    max-width: 700px;
}

.user-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
}

.user-detail-item {
    background: var(--background-elevated);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
}

.user-detail-item label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
}

.user-detail-item .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin-top: 4px;
}

.skills-list, .badges-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
}

.skill-tag, .badge-tag {
    padding: 4px 10px;
    border-radius: var(--radius-full);
    font-size: 12px;
    background: var(--primary-soft);
    color: var(--primary);
}

.badge-tag {
    background: var(--warning-soft);
    color: var(--warning);
}
</style>

<script>
// User data for JavaScript
const usersData = <?= json_encode(array_map(function($u) {
    unset($u['authToken']);
    unset($u['tokenExpiry']);
    return $u;
}, $users)) ?>;

// Search functionality
document.getElementById('userSearch').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
});

function viewUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    const content = `
        <div class="user-detail-grid">
            <div class="user-detail-item">
                <label>Navn</label>
                <div class="value">${user.name || 'Ikke oppgitt'}</div>
            </div>
            <div class="user-detail-item">
                <label>Telefon</label>
                <div class="value">${user.phone}</div>
            </div>
            <div class="user-detail-item">
                <label>E-post</label>
                <div class="value">${user.email || 'Ikke oppgitt'}</div>
            </div>
            <div class="user-detail-item">
                <label>Nivå</label>
                <div class="value">${user.levelName || 'Nybegynner'} (Nivå ${user.level || 1})</div>
            </div>
            <div class="user-detail-item">
                <label>Totale poeng</label>
                <div class="value">${(user.totalPoints || 0).toLocaleString()}</div>
            </div>
            <div class="user-detail-item">
                <label>Fullførte aktiviteter</label>
                <div class="value">${user.completedActivities || 0}</div>
            </div>
            <div class="user-detail-item">
                <label>Fullførte ekspedisjoner</label>
                <div class="value">${user.completedExpeditions || 0}</div>
            </div>
            <div class="user-detail-item">
                <label>Medlem siden</label>
                <div class="value">${new Date(user.memberSince || user.createdAt).toLocaleDateString('nb-NO')}</div>
            </div>
        </div>
        
        ${user.skills && user.skills.length > 0 ? `
            <h3 style="margin-top: var(--space-4);">Ferdigheter</h3>
            <div class="skills-list">
                ${user.skills.map(s => `<span class="skill-tag">${s.name} (Nivå ${s.level})</span>`).join('')}
            </div>
        ` : ''}
        
        ${user.badges && user.badges.length > 0 ? `
            <h3 style="margin-top: var(--space-4);">Merker</h3>
            <div class="badges-list">
                ${user.badges.map(b => `<span class="badge-tag">${b.name}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('userDetailContent').innerHTML = content;
    document.getElementById('userDetailModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userDetailModal').classList.remove('active');
}

async function deleteUser(userId) {
    if (!confirm('Er du sikker på at du vil slette denne brukeren? Dette kan ikke angres.')) {
        return;
    }
    
    try {
        // Load current users
        const response = await fetch('api/users.php');
        const users = await response.json();
        
        // Filter out the user to delete
        const updatedUsers = users.filter(u => u.id !== userId);
        
        // Save
        await saveData('users', updatedUsers);
        
        // Remove row from table
        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
        if (row) {
            row.remove();
        }
        
        showNotification('Bruker slettet', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Kunne ikke slette bruker', 'error');
    }
}

// Close modal on escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUserModal();
    }
});
</script>
