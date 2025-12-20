<?php
$admin = readJsonFile(JSON_ADMINISTRATION);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showAdminModal()">
            <i class="fas fa-plus"></i> Legg til person
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Rolle</th>
                    <th>Navn</th>
                    <th>Telefon</th>
                    <th>E-post</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($admin as $person): ?>
                <tr>
                    <td><?= $person['id'] ?></td>
                    <td><?= htmlspecialchars($person['role']) ?></td>
                    <td><?= htmlspecialchars($person['name']) ?></td>
                    <td><?= htmlspecialchars($person['phone'] ?? '') ?></td>
                    <td><?= htmlspecialchars($person['email'] ?? '') ?></td>
                    <td>
                        <button class="btn-icon" onclick="editAdmin(<?= htmlspecialchars(json_encode($person)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteAdmin(<?= $person['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Admin Modal -->
<div id="adminModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="adminModalTitle">Legg til person</h3>
            <button class="modal-close" onclick="closeAdminModal()">&times;</button>
        </div>
        <form id="adminForm" class="admin-form">
            <input type="hidden" name="id" id="adminId">
            <div class="form-group">
                <label>Rolle</label>
                <input type="text" name="role" id="adminRole" required>
            </div>
            <div class="form-group">
                <label>Navn</label>
                <input type="text" name="name" id="adminName" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" name="phone" id="adminPhone">
                </div>
                <div class="form-group">
                    <label>E-post</label>
                    <input type="email" name="email" id="adminEmail">
                </div>
            </div>
            <div class="form-group">
                <label>Bilde (filnavn)</label>
                <input type="text" name="image" id="adminImage" placeholder="roger.png">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeAdminModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentAdmin = null;

function showAdminModal(item = null) {
    currentAdmin = item;
    document.getElementById('adminModalTitle').textContent = item ? 'Rediger person' : 'Legg til person';
    document.getElementById('adminModal').style.display = 'block';
    
    if (item) {
        document.getElementById('adminId').value = item.id;
        document.getElementById('adminRole').value = item.role || '';
        document.getElementById('adminName').value = item.name || '';
        document.getElementById('adminPhone').value = item.phone || '';
        document.getElementById('adminEmail').value = item.email || '';
        document.getElementById('adminImage').value = item.image || '';
    } else {
        document.getElementById('adminForm').reset();
        document.getElementById('adminId').value = '';
    }
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    currentAdmin = null;
}

function editAdmin(item) {
    showAdminModal(item);
}

async function deleteAdmin(id) {
    if (!confirm('Er du sikker på at du vil slette denne personen?')) return;
    
    const admin = await fetch('api/administration.php').then(r => r.json());
    const updated = admin.filter(a => a.id != id);
    await saveData('administration', updated);
    location.reload();
}

document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const admin = await fetch('api/administration.php').then(r => r.json());
    
    if (data.id) {
        const index = admin.findIndex(a => a.id == data.id);
        if (index !== -1) {
            admin[index] = { ...admin[index], ...data };
        }
    } else {
        const newId = admin.length > 0 ? Math.max(...admin.map(a => a.id)) + 1 : 1;
        data.id = newId;
        admin.push(data);
    }
    
    await saveData('administration', admin);
    closeAdminModal();
    location.reload();
});
</script>
