<?php
$news = readJsonFile(JSON_NEWS);
?>

<div class="admin-page">
    <div class="page-header">
        <button class="btn btn-primary" onclick="showNewsModal()">
            <i class="fas fa-plus"></i> Legg til nyhet
        </button>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tittel</th>
                    <th>Dato</th>
                    <th>Kategori</th>
                    <th>Handlinger</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($news as $item): ?>
                <tr>
                    <td><?= $item['id'] ?></td>
                    <td><?= htmlspecialchars($item['title']) ?></td>
                    <td><?= htmlspecialchars($item['date']) ?></td>
                    <td><span class="badge"><?= htmlspecialchars($item['category']) ?></span></td>
                    <td>
                        <button class="btn-icon" onclick="editNews(<?= htmlspecialchars(json_encode($item)) ?>)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteNews(<?= $item['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- News Modal -->
<div id="newsModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">Legg til nyhet</h3>
            <button class="modal-close" onclick="closeNewsModal()">&times;</button>
        </div>
        <form id="newsForm" class="admin-form">
            <input type="hidden" name="id" id="newsId">
            <div class="form-group">
                <label>Tittel</label>
                <input type="text" name="title" id="newsTitle" required>
            </div>
            <div class="form-group">
                <label>Dato</label>
                <input type="date" name="date" id="newsDate" required>
            </div>
            <div class="form-group">
                <label>Kategori</label>
                <input type="text" name="category" id="newsCategory" required>
            </div>
            <div class="form-group">
                <label>Ingress</label>
                <textarea name="excerpt" id="newsExcerpt" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label>Bilde URL</label>
                <input type="url" name="image" id="newsImage">
            </div>
            <div class="form-group">
                <label>Lese-tid</label>
                <input type="text" name="readTime" id="newsReadTime" placeholder="2 min">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeNewsModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">Lagre</button>
            </div>
        </form>
    </div>
</div>

<script>
let currentNews = null;

function showNewsModal(item = null) {
    currentNews = item;
    document.getElementById('modalTitle').textContent = item ? 'Rediger nyhet' : 'Legg til nyhet';
    document.getElementById('newsModal').style.display = 'block';
    
    if (item) {
        document.getElementById('newsId').value = item.id;
        document.getElementById('newsTitle').value = item.title || '';
        document.getElementById('newsDate').value = item.date || '';
        document.getElementById('newsCategory').value = item.category || '';
        document.getElementById('newsExcerpt').value = item.excerpt || '';
        document.getElementById('newsImage').value = item.image || '';
        document.getElementById('newsReadTime').value = item.readTime || '';
    } else {
        document.getElementById('newsForm').reset();
        document.getElementById('newsId').value = '';
    }
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
    currentNews = null;
}

function editNews(item) {
    showNewsModal(item);
}

async function deleteNews(id) {
    if (!confirm('Er du sikker på at du vil slette denne nyheten?')) return;
    
    const response = await fetch(`api/news.php?id=${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        location.reload();
    }
}

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const method = data.id ? 'PUT' : 'POST';
    const response = await fetch('api/news.php', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
        closeNewsModal();
        location.reload();
    }
});
</script>
