<?php
$activities = readJsonFile(JSON_CORE_ACTIVITIES);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showCoreActivityModal()">
            <i class="fas fa-plus"></i> Legg til kjerneaktivitet
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tittel</th>
                    <th>Beskrivelse</th>
                    <th>Ikon</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($activities as $activity): ?>
                <tr>
                    <td><?= $activity['id'] ?></td>
                    <td><?= htmlspecialchars($activity['title']) ?></td>
                    <td><?= htmlspecialchars(substr($activity['description'] ?? '', 0, 50)) ?>...</td>
                    <td><span class="badge"><?= htmlspecialchars($activity['icon'] ?? '') ?></span></td>
                    <td>
                        <button class="btn-icon" onclick="editCoreActivity(<?= htmlspecialchars(json_encode($activity)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteCoreActivity(<?= $activity['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Core Activity Modal -->
<div id="coreActivityModal" class="modal">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h3 id="coreActivityModalTitle">Legg til kjerneaktivitet</h3>
            <button class="modal-close" onclick="closeCoreActivityModal()">&times;</button>
        </div>
        <form id="coreActivityForm" class="admin-form">
            <input type="hidden" name="id" id="coreActivityId">
            <div class="form-group">
                <label>Tittel</label>
                <input type="text" name="title" id="coreActivityTitle" required>
            </div>
            <div class="form-group">
                <label>Beskrivelse</label>
                <textarea name="description" id="coreActivityDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label>Detaljert beskrivelse</label>
                <textarea name="detailedDescription" id="coreActivityDetailedDescription" rows="6"></textarea>
            </div>
            <div class="form-group">
                <label>Ikon</label>
                <input type="text" name="icon" id="coreActivityIcon" placeholder="map" required>
            </div>
            <div class="form-group">
                <label>Nettsted</label>
                <input type="url" name="website" id="coreActivityWebsite">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>År</label>
                    <input type="number" name="year" id="coreActivityYear">
                </div>
                <div class="form-group">
                    <label>Deltakere</label>
                    <input type="number" name="participants" id="coreActivityParticipants">
                </div>
            </div>
            <div class="form-group">
                <label>Sted</label>
                <input type="text" name="location" id="coreActivityLocation">
            </div>
            <div class="form-group">
                <label>Oppgaver (én per linje)</label>
                <textarea name="tasks" id="coreActivityTasks" rows="4" placeholder="Tidtaking&#10;Hjelpe hunder til spann"></textarea>
            </div>
            <div class="form-group">
                <label>Partnere (én per linje)</label>
                <textarea name="partners" id="coreActivityPartners" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Påvirkning/Beskrivelse</label>
                <textarea name="impact" id="coreActivityImpact" rows="4"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeCoreActivityModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentCoreActivity = null;

function showCoreActivityModal(item = null) {
    currentCoreActivity = item;
    document.getElementById('coreActivityModalTitle').textContent = item ? 'Rediger kjerneaktivitet' : 'Legg til kjerneaktivitet';
    document.getElementById('coreActivityModal').style.display = 'block';
    
    if (item) {
        document.getElementById('coreActivityId').value = item.id;
        document.getElementById('coreActivityTitle').value = item.title || '';
        document.getElementById('coreActivityDescription').value = item.description || '';
        document.getElementById('coreActivityDetailedDescription').value = item.detailedDescription || '';
        document.getElementById('coreActivityIcon').value = item.icon || '';
        document.getElementById('coreActivityWebsite').value = item.website || '';
        document.getElementById('coreActivityYear').value = item.year || '';
        document.getElementById('coreActivityParticipants').value = item.participants || '';
        document.getElementById('coreActivityLocation').value = item.location || '';
        document.getElementById('coreActivityTasks').value = Array.isArray(item.tasks) ? item.tasks.join('\n') : '';
        document.getElementById('coreActivityPartners').value = Array.isArray(item.partners) ? item.partners.join('\n') : '';
        document.getElementById('coreActivityImpact').value = item.impact || '';
    } else {
        document.getElementById('coreActivityForm').reset();
        document.getElementById('coreActivityId').value = '';
    }
}

function closeCoreActivityModal() {
    document.getElementById('coreActivityModal').style.display = 'none';
    currentCoreActivity = null;
}

function editCoreActivity(item) {
    showCoreActivityModal(item);
}

async function deleteCoreActivity(id) {
    if (!confirm('Er du sikker på at du vil slette denne kjerneaktiviteten?')) return;
    
    const activities = await fetch('api/core-activities.php').then(r => r.json());
    const updated = activities.filter(a => a.id != id);
    await saveData('core-activities', updated);
    location.reload();
}

document.getElementById('coreActivityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Convert tasks and partners from textarea to arrays
    if (data.tasks) {
        data.tasks = data.tasks.split('\n').filter(s => s.trim());
    }
    if (data.partners) {
        data.partners = data.partners.split('\n').filter(s => s.trim());
    }
    
    const activities = await fetch('api/core-activities.php').then(r => r.json());
    
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
    
    await saveData('core-activities', activities);
    closeCoreActivityModal();
    location.reload();
});
</script>

