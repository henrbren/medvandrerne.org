<?php
$activities = readJsonFile(JSON_ACTIVITIES);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showActivityModal()">
            <i class="fas fa-plus"></i> Legg til aktivitet
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tittel</th>
                    <th>Dato</th>
                    <th>Type</th>
                    <th>Sted</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($activities as $item): ?>
                <tr>
                    <td><?= $item['id'] ?></td>
                    <td><?= htmlspecialchars($item['title']) ?></td>
                    <td><?= htmlspecialchars($item['date']) ?></td>
                    <td><span class="badge"><?= htmlspecialchars($item['type']) ?></span></td>
                    <td><?= htmlspecialchars($item['location'] ?? '') ?></td>
                    <td>
                        <button class="btn-icon" onclick="editActivity(<?= htmlspecialchars(json_encode($item)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteActivity(<?= $item['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Activity Modal -->
<div id="activityModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="activityModalTitle">Legg til aktivitet</h3>
            <button class="modal-close" onclick="closeActivityModal()">&times;</button>
        </div>
        <form id="activityForm" class="admin-form">
            <input type="hidden" name="id" id="activityId">
            <div class="form-group">
                <label>Tittel</label>
                <input type="text" name="title" id="activityTitle" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Dato</label>
                    <input type="date" name="date" id="activityDate" required>
                </div>
                <div class="form-group">
                    <label>Sluttdato (flerdagers)</label>
                    <input type="date" name="endDate" id="activityEndDate">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tid</label>
                    <input type="text" name="time" id="activityTime" placeholder="18:00-19:00">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select name="type" id="activityType" required>
                        <option value="Møte">Møte</option>
                        <option value="Tur">Tur</option>
                        <option value="Motivasjonstur">Motivasjonstur</option>
                        <option value="Arrangement">Arrangement</option>
                        <option value="Konferanse">Konferanse</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Sted</label>
                <input type="text" name="location" id="activityLocation">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="multiDay" id="activityMultiDay"> Flerdagers aktivitet
                </label>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeActivityModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentActivity = null;

function showActivityModal(item = null) {
    currentActivity = item;
    document.getElementById('activityModalTitle').textContent = item ? 'Rediger aktivitet' : 'Legg til aktivitet';
    document.getElementById('activityModal').style.display = 'block';
    
    if (item) {
        document.getElementById('activityId').value = item.id;
        document.getElementById('activityTitle').value = item.title || '';
        document.getElementById('activityDate').value = item.date || '';
        document.getElementById('activityEndDate').value = item.endDate || '';
        document.getElementById('activityTime').value = item.time || '';
        document.getElementById('activityType').value = item.type || '';
        document.getElementById('activityLocation').value = item.location || '';
        document.getElementById('activityMultiDay').checked = item.multiDay || false;
    } else {
        document.getElementById('activityForm').reset();
        document.getElementById('activityId').value = '';
    }
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
    currentActivity = null;
}

function editActivity(item) {
    showActivityModal(item);
}

async function deleteActivity(id) {
    if (!confirm('Er du sikker på at du vil slette denne aktiviteten?')) return;
    
    const activities = await fetch('api/activities.php').then(r => r.json());
    const updated = activities.filter(a => a.id != id);
    await saveData('activities', updated);
    location.reload();
}

document.getElementById('activityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.multiDay = document.getElementById('activityMultiDay').checked;
    
    const activities = await fetch('api/activities.php').then(r => r.json());
    
    if (data.id) {
        const index = activities.findIndex(a => a.id == data.id);
        if (index !== -1) {
            activities[index] = { ...activities[index], ...data };
        }
    } else {
        const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
        data.id = newId;
        activities.push(data);
    }
    
    await saveData('activities', activities);
    closeActivityModal();
    location.reload();
});
</script>

