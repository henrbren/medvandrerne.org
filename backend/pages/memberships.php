<?php
/**
 * Admin Dashboard - Memberships Page
 */
$users = readJsonFile(JSON_USERS, []);
$memberships = readJsonFile(JSON_MEMBERSHIPS, ['transactions' => [], 'stats' => []]);

// Get users with membership
$membersWithMembership = array_filter($users, function($u) {
    return isset($u['membership']);
});

// Calculate stats
$activeMembers = array_filter($membersWithMembership, function($u) {
    return ($u['membership']['status'] ?? '') === 'active';
});

$pendingMembers = array_filter($membersWithMembership, function($u) {
    return ($u['membership']['status'] ?? '') === 'pending';
});

$totalRevenue = $memberships['stats']['totalRevenue'] ?? 0;
$transactionCount = count($memberships['transactions'] ?? []);
?>

<div class="page-header">
    <div class="page-header-content">
        <h1><i class="fas fa-crown"></i> Medlemskap</h1>
        <p>Administrer medlemskap og se inntekter</p>
    </div>
</div>

<!-- Stats Cards -->
<div class="stats-grid" style="margin-bottom: var(--space-6);">
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--success), #4AE85C);">
            <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= count($activeMembers) ?>"><?= count($activeMembers) ?></span>
            <span class="stat-label">Aktive medlemmer</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--warning), #FFD60A);">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= count($pendingMembers) ?>"><?= count($pendingMembers) ?></span>
            <span class="stat-label">Venter på betaling</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--primary), var(--primary-light));">
            <i class="fas fa-coins"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value"><?= number_format($totalRevenue, 0, ',', ' ') ?> kr</span>
            <span class="stat-label">Total inntekt</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, var(--info), #5AC8FA);">
            <i class="fas fa-receipt"></i>
        </div>
        <div class="stat-content">
            <span class="stat-value" data-count="<?= $transactionCount ?>"><?= $transactionCount ?></span>
            <span class="stat-label">Transaksjoner</span>
        </div>
    </div>
</div>

<!-- Membership Tiers Overview -->
<div class="content-card" style="margin-bottom: var(--space-6);">
    <div class="card-header">
        <h2><i class="fas fa-layer-group"></i> Medlemskapsnivåer</h2>
    </div>
    <div class="tiers-grid">
        <?php foreach (MEMBERSHIP_TIERS as $tierId => $tier): ?>
        <div class="tier-card" style="border-color: <?= $tier['color'] ?>;">
            <div class="tier-header" style="background: <?= $tier['color'] ?>;">
                <span class="tier-name"><?= htmlspecialchars($tier['name']) ?></span>
                <span class="tier-price"><?= $tier['price'] ?> kr/mnd</span>
            </div>
            <div class="tier-stats">
                <span class="tier-count"><?= $memberships['stats']['membersByTier'][$tierId] ?? 0 ?></span>
                <span class="tier-label">medlemmer</span>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Pending Payments -->
<?php if (count($pendingMembers) > 0): ?>
<div class="content-card" style="margin-bottom: var(--space-6);">
    <div class="card-header">
        <h2><i class="fas fa-hourglass-half"></i> Venter på betaling</h2>
    </div>
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Bruker</th>
                    <th>Telefon</th>
                    <th>Nivå</th>
                    <th>Beløp</th>
                    <th>Valgt</th>
                    <th>Handling</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($pendingMembers as $member): ?>
                <tr data-user-id="<?= htmlspecialchars($member['id']) ?>">
                    <td><?= htmlspecialchars($member['name'] ?: 'Ikke oppgitt') ?></td>
                    <td><?= htmlspecialchars($member['phone']) ?></td>
                    <td>
                        <span class="tier-badge" style="background: <?= MEMBERSHIP_TIERS[$member['membership']['tier']]['color'] ?? '#999' ?>;">
                            <?= htmlspecialchars($member['membership']['tierName']) ?>
                        </span>
                    </td>
                    <td><?= $member['membership']['price'] ?> kr</td>
                    <td><?= date('d.m.Y H:i', strtotime($member['membership']['selectedAt'])) ?></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="confirmPayment('<?= $member['id'] ?>')">
                            <i class="fas fa-check"></i> Bekreft betaling
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<?php endif; ?>

<!-- Active Members -->
<div class="content-card">
    <div class="card-header">
        <h2><i class="fas fa-users"></i> Aktive medlemmer</h2>
        <input type="text" id="memberSearch" placeholder="Søk..." class="form-input" style="width: 200px;">
    </div>
    <div class="table-container">
        <table class="data-table" id="membersTable">
            <thead>
                <tr>
                    <th>Bruker</th>
                    <th>Telefon</th>
                    <th>Nivå</th>
                    <th>Beløp</th>
                    <th>Betalt</th>
                    <th>Utløper</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($activeMembers) === 0): ?>
                <tr>
                    <td colspan="7" class="empty-message">
                        <i class="fas fa-user-slash"></i>
                        <p>Ingen aktive medlemmer ennå</p>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($activeMembers as $member): 
                    $daysLeft = ceil((strtotime($member['membership']['expiresAt']) - time()) / 86400);
                    $isExpiringSoon = $daysLeft <= 7;
                ?>
                <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar" style="background: <?= MEMBERSHIP_TIERS[$member['membership']['tier']]['color'] ?? '#999' ?>;">
                                <?= strtoupper(substr($member['name'] ?: 'M', 0, 1)) ?>
                            </div>
                            <div class="user-info">
                                <span class="user-name"><?= htmlspecialchars($member['name'] ?: 'Ikke oppgitt') ?></span>
                                <span class="user-email"><?= htmlspecialchars($member['email'] ?: '-') ?></span>
                            </div>
                        </div>
                    </td>
                    <td><?= htmlspecialchars($member['phone']) ?></td>
                    <td>
                        <span class="tier-badge" style="background: <?= MEMBERSHIP_TIERS[$member['membership']['tier']]['color'] ?? '#999' ?>;">
                            <?= htmlspecialchars($member['membership']['tierName']) ?>
                        </span>
                    </td>
                    <td><?= $member['membership']['price'] ?> kr</td>
                    <td><?= date('d.m.Y', strtotime($member['membership']['paidAt'])) ?></td>
                    <td>
                        <span class="<?= $isExpiringSoon ? 'expiring-soon' : '' ?>">
                            <?= date('d.m.Y', strtotime($member['membership']['expiresAt'])) ?>
                            <?php if ($isExpiringSoon): ?>
                            <small>(<?= $daysLeft ?> dager)</small>
                            <?php endif; ?>
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-active">Aktiv</span>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Recent Transactions -->
<?php if (count($memberships['transactions'] ?? []) > 0): ?>
<div class="content-card" style="margin-top: var(--space-6);">
    <div class="card-header">
        <h2><i class="fas fa-history"></i> Siste transaksjoner</h2>
    </div>
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Telefon</th>
                    <th>Nivå</th>
                    <th>Beløp</th>
                    <th>Metode</th>
                    <th>Dato</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                $recentTransactions = array_slice(array_reverse($memberships['transactions']), 0, 10);
                foreach ($recentTransactions as $txn): 
                ?>
                <tr>
                    <td><code><?= htmlspecialchars(substr($txn['id'], 0, 12)) ?>...</code></td>
                    <td><?= htmlspecialchars($txn['phone']) ?></td>
                    <td><?= htmlspecialchars($txn['tierName']) ?></td>
                    <td><?= $txn['amount'] ?> kr</td>
                    <td>
                        <span class="payment-method"><?= htmlspecialchars($txn['paymentMethod']) ?></span>
                    </td>
                    <td><?= date('d.m.Y H:i', strtotime($txn['createdAt'])) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<?php endif; ?>

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

.tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
    padding: var(--space-4);
}

.tier-card {
    border: 2px solid;
    border-radius: var(--radius-lg);
    overflow: hidden;
    text-align: center;
}

.tier-header {
    padding: var(--space-3);
    color: white;
}

.tier-name {
    display: block;
    font-weight: 700;
    font-size: 14px;
}

.tier-price {
    font-size: 12px;
    opacity: 0.9;
}

.tier-stats {
    padding: var(--space-4);
    background: var(--background-elevated);
}

.tier-count {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
}

.tier-label {
    font-size: 12px;
    color: var(--text-secondary);
}

.tier-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    color: white;
    font-size: 12px;
    font-weight: 600;
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

.expiring-soon {
    color: var(--warning);
    font-weight: 600;
}

.payment-method {
    text-transform: capitalize;
    background: var(--background-elevated);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: 12px;
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
</style>

<script>
// Search functionality
document.getElementById('memberSearch')?.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#membersTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
});

async function confirmPayment(userId) {
    if (!confirm('Bekrefte betaling for denne brukeren?')) {
        return;
    }
    
    try {
        // Find user and get their token (for demo purposes, we'll use admin confirmation)
        const response = await fetch('api/users.php');
        const users = await response.json();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('Bruker ikke funnet', 'error');
            return;
        }
        
        // Update user membership directly
        user.membership.status = 'active';
        user.membership.paidAt = new Date().toISOString();
        user.membership.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        user.membership.paymentMethod = 'manual';
        user.membership.transactionId = 'manual_' + Math.random().toString(36).substr(2, 9);
        
        if (!user.memberSince) {
            user.memberSince = new Date().toISOString().split('T')[0];
        }
        
        // Save updated user
        await saveData('users', users);
        
        // Update memberships stats
        const membershipsResponse = await fetch('api/all.php');
        const allData = await membershipsResponse.json();
        
        showNotification('Betaling bekreftet!', 'success');
        
        // Reload page to show updated data
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Error confirming payment:', error);
        showNotification('Kunne ikke bekrefte betaling', 'error');
    }
}
</script>
