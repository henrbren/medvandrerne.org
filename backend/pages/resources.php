<?php
$resources = readJsonFile(JSON_RESOURCES);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showResourceModal()">
            <i class="fas fa-plus"></i> Legg til ressurs
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tittel</th>
                    <th>Type</th>
                    <th>Kategori</th>
                    <th>URL</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($resources as $resource): ?>
                <tr>
                    <td><?= $resource['id'] ?></td>
                    <td><?= htmlspecialchars($resource['title']) ?></td>
                    <td><span class="badge"><?= htmlspecialchars($resource['type']) ?></span></td>
                    <td><?= htmlspecialchars($resource['category']) ?></td>
                    <td><a href="<?= htmlspecialchars($resource['url']) ?>" target="_blank">Åpne</a></td>
                    <td>
                        <button class="btn-icon" onclick="editResource(<?= htmlspecialchars(json_encode($resource)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteResource(<?= $resource['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Resource Modal -->
<div id="resourceModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="resourceModalTitle">Legg til ressurs</h3>
            <button class="modal-close" onclick="closeResourceModal()">&times;</button>
        </div>
        <form id="resourceForm" class="admin-form">
            <input type="hidden" name="id" id="resourceId">
            <div class="form-group">
                <label>Tittel</label>
                <input type="text" name="title" id="resourceTitle" required>
            </div>
            <div class="form-group">
                <label>Beskrivelse</label>
                <textarea name="description" id="resourceDescription" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="type" id="resourceType" required>
                        <option value="Artikkel">Artikkel</option>
                        <option value="Guide">Guide</option>
                        <option value="Rapport">Rapport</option>
                        <option value="Informasjon">Informasjon</option>
                        <option value="Veileder">Veileder</option>
                        <option value="Program">Program</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <input type="text" name="category" id="resourceCategory" required>
                </div>
            </div>
            <div class="form-group">
                <label>Ikon (ikonnavn)</label>
                <input type="text" name="icon" id="resourceIcon" placeholder="medical" required>
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" name="url" id="resourceUrl" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeResourceModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentResource = null;

function showResourceModal(item = null) {
    currentResource = item;
    document.getElementById('resourceModalTitle').textContent = item ? 'Rediger ressurs' : 'Legg til ressurs';
    document.getElementById('resourceModal').style.display = 'block';
    
    if (item) {
        document.getElementById('resourceId').value = item.id;
        document.getElementById('resourceTitle').value = item.title || '';
        document.getElementById('resourceDescription').value = item.description || '';
        document.getElementById('resourceType').value = item.type || '';
        document.getElementById('resourceCategory').value = item.category || '';
        document.getElementById('resourceIcon').value = item.icon || '';
        document.getElementById('resourceUrl').value = item.url || '';
    } else {
        document.getElementById('resourceForm').reset();
        document.getElementById('resourceId').value = '';
    }
}

function closeResourceModal() {
    document.getElementById('resourceModal').style.display = 'none';
    currentResource = null;
}

function editResource(item) {
    showResourceModal(item);
}

async function deleteResource(id) {
    if (!confirm('Er du sikker på at du vil slette denne ressursen?')) return;
    
    const response = await fetch(`api/resources.php?id=${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        location.reload();
    }
}

document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const method = data.id ? 'PUT' : 'POST';
    const response = await fetch('api/resources.php', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
        closeResourceModal();
        location.reload();
    }
});
</script>

