<?php
$groups = readJsonFile(JSON_LOCAL_GROUPS);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showGroupModal()">
            <i class="fas fa-plus"></i> Legg til lokallag
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Navn</th>
                    <th>Koordinator</th>
                    <th>Telefon</th>
                    <th>E-post</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($groups as $group): ?>
                <tr>
                    <td><?= $group['id'] ?></td>
                    <td><?= htmlspecialchars($group['name']) ?></td>
                    <td><?= htmlspecialchars($group['coordinator'] ?? '') ?></td>
                    <td><?= htmlspecialchars($group['phone'] ?? '') ?></td>
                    <td><?= htmlspecialchars($group['email'] ?? '') ?></td>
                    <td>
                        <button class="btn-icon" onclick="editGroup(<?= htmlspecialchars(json_encode($group)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteGroup(<?= $group['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Group Modal -->
<div id="groupModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="groupModalTitle">Legg til lokallag</h3>
            <button class="modal-close" onclick="closeGroupModal()">&times;</button>
        </div>
        <form id="groupForm" class="admin-form">
            <input type="hidden" name="id" id="groupId">
            <div class="form-group">
                <label>Navn</label>
                <input type="text" name="name" id="groupName" required>
            </div>
            <div class="form-group">
                <label>Koordinator</label>
                <input type="text" name="coordinator" id="groupCoordinator">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" name="phone" id="groupPhone">
                </div>
                <div class="form-group">
                    <label>E-post</label>
                    <input type="email" name="email" id="groupEmail">
                </div>
            </div>
            <div class="form-group">
                <label>Facebook-gruppe URL</label>
                <input type="url" name="facebook" id="groupFacebook">
            </div>
            <div class="form-group">
                <label>Koordinator bilde (filnavn)</label>
                <input type="text" name="coordinatorImage" id="groupCoordinatorImage" placeholder="siri.png">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeGroupModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentGroup = null;

function showGroupModal(item = null) {
    currentGroup = item;
    document.getElementById('groupModalTitle').textContent = item ? 'Rediger lokallag' : 'Legg til lokallag';
    document.getElementById('groupModal').style.display = 'block';
    
    if (item) {
        document.getElementById('groupId').value = item.id;
        document.getElementById('groupName').value = item.name || '';
        document.getElementById('groupCoordinator').value = item.coordinator || '';
        document.getElementById('groupPhone').value = item.phone || '';
        document.getElementById('groupEmail').value = item.email || '';
        document.getElementById('groupFacebook').value = item.facebook || '';
        document.getElementById('groupCoordinatorImage').value = item.coordinatorImage || '';
    } else {
        document.getElementById('groupForm').reset();
        document.getElementById('groupId').value = '';
    }
}

function closeGroupModal() {
    document.getElementById('groupModal').style.display = 'none';
    currentGroup = null;
}

function editGroup(item) {
    showGroupModal(item);
}

async function deleteGroup(id) {
    if (!confirm('Er du sikker på at du vil slette dette lokallaget?')) return;
    
    const groups = await fetch('api/local-groups.php').then(r => r.json());
    const updated = groups.filter(g => g.id != id);
    await saveData('local-groups', updated);
    location.reload();
}

document.getElementById('groupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const groups = await fetch('api/local-groups.php').then(r => r.json());
    
    if (data.id) {
        const index = groups.findIndex(g => g.id == data.id);
        if (index !== -1) {
            groups[index] = { ...groups[index], ...data };
        }
    } else {
        const newId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
        data.id = newId;
        groups.push(data);
    }
    
    await saveData('local-groups', groups);
    closeGroupModal();
    location.reload();
});
</script>

