<?php
$gallery = readJsonFile(JSON_GALLERY);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showGalleryModal()">
            <i class="fas fa-plus"></i> Legg til bilde
        </button>
    </div>

    <div class="gallery-grid">
        <?php foreach ($gallery as $item): ?>
        <div class="gallery-item">
            <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
            <div class="gallery-item-info">
                <h4><?= htmlspecialchars($item['title']) ?></h4>
                <p><?= htmlspecialchars($item['category']) ?></p>
                <div class="gallery-item-actions">
                    <button class="btn-icon" onclick="editGallery(<?= htmlspecialchars(json_encode($item)) ?>)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteGallery(<?= $item['id'] ?>)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Gallery Modal -->
<div id="galleryModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="galleryModalTitle">Legg til bilde</h3>
            <button class="modal-close" onclick="closeGalleryModal()">&times;</button>
        </div>
        <form id="galleryForm" class="admin-form">
            <input type="hidden" name="id" id="galleryId">
            <div class="form-group">
                <label>Tittel</label>
                <input type="text" name="title" id="galleryTitle" required>
            </div>
            <div class="form-group">
                <label>Beskrivelse</label>
                <textarea name="description" id="galleryDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Bilde URL</label>
                <input type="url" name="image" id="galleryImage" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Kategori</label>
                    <input type="text" name="category" id="galleryCategory" required>
                </div>
                <div class="form-group">
                    <label>Dato (YYYY-MM)</label>
                    <input type="text" name="date" id="galleryDate" placeholder="2024-02">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeGalleryModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentGallery = null;

function showGalleryModal(item = null) {
    currentGallery = item;
    document.getElementById('galleryModalTitle').textContent = item ? 'Rediger bilde' : 'Legg til bilde';
    document.getElementById('galleryModal').style.display = 'block';
    
    if (item) {
        document.getElementById('galleryId').value = item.id;
        document.getElementById('galleryTitle').value = item.title || '';
        document.getElementById('galleryDescription').value = item.description || '';
        document.getElementById('galleryImage').value = item.image || '';
        document.getElementById('galleryCategory').value = item.category || '';
        document.getElementById('galleryDate').value = item.date || '';
    } else {
        document.getElementById('galleryForm').reset();
        document.getElementById('galleryId').value = '';
    }
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
    currentGallery = null;
}

function editGallery(item) {
    showGalleryModal(item);
}

async function deleteGallery(id) {
    if (!confirm('Er du sikker på at du vil slette dette bildet?')) return;
    
    const response = await fetch(`api/gallery.php?id=${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        location.reload();
    }
}

document.getElementById('galleryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const method = data.id ? 'PUT' : 'POST';
    const response = await fetch('api/gallery.php', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
        closeGalleryModal();
        location.reload();
    }
});
</script>
