<?php
$news = readJsonFile(JSON_NEWS);

// Sort by date descending
usort($news, function($a, $b) {
    return strtotime($b['date'] ?? '2000-01-01') - strtotime($a['date'] ?? '2000-01-01');
});

// Define categories
$categories = ['Samarbeid', 'Arrangement', 'Lokallag', 'Rapport', 'Frivillig', 'Annet'];
?>

<style>
/* News-specific styles */
.news-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.news-stats {
    display: flex;
    gap: 1.5rem;
}

.stat-box {
    background: var(--surface);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    text-align: center;
}

.stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.news-card {
    background: var(--surface);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}

.news-card-image {
    position: relative;
    height: 180px;
    background: var(--background);
    overflow: hidden;
}

.news-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.news-card-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--surface) 0%, var(--background) 100%);
}

.news-card-image-placeholder i {
    font-size: 3rem;
    color: var(--text-tertiary);
}

.news-card-category {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.news-card-content {
    padding: 1.25rem;
}

.news-card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-card-excerpt {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-card-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

.news-card-meta i {
    margin-right: 0.25rem;
}

.news-card-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0 1.25rem 1.25rem;
}

.news-card-actions .btn {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.8rem;
}

/* Category colors */
.category-samarbeid { background: #10B981; color: white; }
.category-arrangement { background: #F59E0B; color: white; }
.category-lokallag { background: #3B82F6; color: white; }
.category-rapport { background: #8B5CF6; color: white; }
.category-frivillig { background: #EC4899; color: white; }
.category-annet { background: #6B7280; color: white; }

/* Image upload area */
.image-upload-container {
    margin-bottom: 1rem;
}

.image-upload-area {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--background);
}

.image-upload-area:hover {
    border-color: var(--primary);
    background: rgba(255, 69, 58, 0.05);
}

.image-upload-area.has-image {
    padding: 0;
    border-style: solid;
    overflow: hidden;
}

.image-upload-area img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.image-upload-area .upload-icon {
    font-size: 2.5rem;
    color: var(--text-tertiary);
    margin-bottom: 0.75rem;
}

.image-upload-area .upload-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.image-upload-area .upload-hint {
    color: var(--text-tertiary);
    font-size: 0.75rem;
    margin-top: 0.5rem;
}

.image-preview-container {
    position: relative;
    display: inline-block;
    width: 100%;
}

.image-preview-container .remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.image-preview-container .remove-image:hover {
    background: var(--danger);
}

/* Gallery upload */
.gallery-upload {
    margin-top: 1rem;
}

.gallery-preview {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
}

.gallery-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-item .remove-gallery-image {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-gallery-btn {
    width: 100px;
    height: 100px;
    border: 2px dashed var(--border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
}

.add-gallery-btn:hover {
    border-color: var(--primary);
    background: rgba(255, 69, 58, 0.05);
}

.add-gallery-btn i {
    font-size: 1.5rem;
    color: var(--text-tertiary);
}

.add-gallery-btn span {
    font-size: 0.65rem;
    color: var(--text-tertiary);
    margin-top: 0.25rem;
}

/* Rich text editor area */
.content-editor {
    min-height: 200px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text);
    resize: vertical;
}

.content-editor:focus {
    outline: none;
    border-color: var(--primary);
}

/* Form sections */
.form-section {
    background: var(--background);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
}

.form-section-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-section-title i {
    color: var(--primary);
}

/* Two column form layout */
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 600px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

/* Tags input */
.tags-input-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-height: 42px;
    align-items: center;
}

.tag-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: var(--primary);
    color: white;
    border-radius: 4px;
    font-size: 0.8rem;
}

.tag-item button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
    opacity: 0.7;
}

.tag-item button:hover {
    opacity: 1;
}

.tags-input {
    border: none;
    background: none;
    flex: 1;
    min-width: 100px;
    padding: 0.25rem;
    color: var(--text);
    font-size: 0.9rem;
}

.tags-input:focus {
    outline: none;
}

/* Loading spinner */
.upload-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--text-tertiary);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

<div class="admin-page">
    <div class="news-header">
        <div>
            <h2 style="margin: 0; color: var(--text);">Nyheter</h2>
            <p style="margin: 0.5rem 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                Administrer nyhetsartikler for appen
            </p>
        </div>
        <div class="news-stats">
            <div class="stat-box">
                <div class="stat-number"><?= count($news) ?></div>
                <div class="stat-label">Artikler</div>
            </div>
        </div>
        <button class="btn btn-primary" onclick="showNewsModal()">
            <i class="fas fa-plus"></i> Ny artikkel
        </button>
    </div>

    <div class="news-grid">
        <?php foreach ($news as $item): 
            $categoryClass = 'category-' . strtolower(str_replace(' ', '-', $item['category'] ?? 'annet'));
        ?>
        <div class="news-card">
            <div class="news-card-image">
                <?php if (!empty($item['image'])): ?>
                    <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                <?php else: ?>
                    <div class="news-card-image-placeholder">
                        <i class="fas fa-newspaper"></i>
                    </div>
                <?php endif; ?>
                <?php if (!empty($item['category'])): ?>
                    <span class="news-card-category <?= $categoryClass ?>">
                        <?= htmlspecialchars($item['category']) ?>
                    </span>
                <?php endif; ?>
            </div>
            <div class="news-card-content">
                <div class="news-card-title"><?= htmlspecialchars($item['title']) ?></div>
                <?php if (!empty($item['excerpt'])): ?>
                    <div class="news-card-excerpt"><?= htmlspecialchars($item['excerpt']) ?></div>
                <?php endif; ?>
                <div class="news-card-meta">
                    <span><i class="far fa-calendar"></i> <?= htmlspecialchars($item['date'] ?? '') ?></span>
                    <?php if (!empty($item['readTime'])): ?>
                        <span><i class="far fa-clock"></i> <?= htmlspecialchars($item['readTime']) ?></span>
                    <?php endif; ?>
                </div>
            </div>
            <div class="news-card-actions">
                <button class="btn btn-secondary" onclick="editNews(<?= htmlspecialchars(json_encode($item)) ?>)">
                    <i class="fas fa-edit"></i> Rediger
                        </button>
                <button class="btn btn-danger" onclick="deleteNews(<?= $item['id'] ?>)">
                            <i class="fas fa-trash"></i>
                        </button>
            </div>
        </div>
                <?php endforeach; ?>
    </div>

    <?php if (empty($news)): ?>
    <div style="text-align: center; padding: 4rem 2rem; color: var(--text-tertiary);">
        <i class="fas fa-newspaper" style="font-size: 4rem; margin-bottom: 1rem;"></i>
        <h3 style="color: var(--text-secondary);">Ingen nyheter ennå</h3>
        <p>Klikk "Ny artikkel" for å legge til den første nyheten</p>
    </div>
    <?php endif; ?>
</div>

<!-- News Modal -->
<div id="newsModal" class="modal">
    <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
            <h3 id="modalTitle">Legg til nyhet</h3>
            <button class="modal-close" onclick="closeNewsModal()">&times;</button>
        </div>
        <form id="newsForm" class="admin-form">
            <input type="hidden" name="id" id="newsId">
            
            <!-- Image Section -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-image"></i> Hovedbilde
                </div>
                <div class="image-upload-container">
                    <div class="image-upload-area" id="imageUploadArea" onclick="triggerImageUpload()">
                        <div id="imagePreview" style="display: none;">
                            <div class="image-preview-container">
                                <img id="previewImg" src="" alt="Preview">
                                <button type="button" class="remove-image" onclick="removeMainImage(event)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div id="uploadPlaceholder">
                            <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                            <div class="upload-text">Klikk for å laste opp bilde</div>
                            <div class="upload-hint">JPG, PNG, GIF eller WEBP (maks 5MB)</div>
                        </div>
                    </div>
                    <input type="file" id="imageFile" accept="image/*" style="display: none;" onchange="handleImageUpload(this)">
                    <input type="hidden" name="image" id="newsImage">
                </div>
            </div>

            <!-- Basic Info -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-info-circle"></i> Grunnleggende informasjon
                </div>
                <div class="form-group">
                    <label>Tittel *</label>
                    <input type="text" name="title" id="newsTitle" required placeholder="Skriv en fengende tittel...">
                </div>
                
                <div class="form-row">
            <div class="form-group">
                        <label>Dato *</label>
                <input type="date" name="date" id="newsDate" required>
            </div>
            <div class="form-group">
                        <label>Kategori *</label>
                        <select name="category" id="newsCategory" required>
                            <option value="">Velg kategori...</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= $cat ?>"><?= $cat ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Lesetid</label>
                        <input type="text" name="readTime" id="newsReadTime" placeholder="f.eks. 3 min">
                    </div>
                    <div class="form-group">
                        <label>Forfatter</label>
                        <input type="text" name="author" id="newsAuthor" placeholder="Navn på forfatter">
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-align-left"></i> Innhold
                </div>
                <div class="form-group">
                    <label>Ingress / Sammendrag *</label>
                    <textarea name="excerpt" id="newsExcerpt" rows="3" required placeholder="Kort beskrivelse som vises i oversikten..."></textarea>
            </div>
            <div class="form-group">
                    <label>Fullstendig innhold</label>
                    <textarea name="content" id="newsContent" class="content-editor" rows="8" placeholder="Skriv hele artikkelen her..."></textarea>
                </div>
            </div>

            <!-- Gallery -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-images"></i> Bildegalleri (valgfritt)
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    Legg til flere bilder som vises i artikkelvisningen
                </p>
                <div class="gallery-preview" id="galleryPreview">
                    <button type="button" class="add-gallery-btn" onclick="triggerGalleryUpload()">
                        <i class="fas fa-plus"></i>
                        <span>Legg til</span>
                    </button>
                </div>
                <input type="file" id="galleryFile" accept="image/*" style="display: none;" onchange="handleGalleryUpload(this)">
                <input type="hidden" name="gallery" id="newsGallery" value="[]">
            </div>

            <!-- Tags -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-tags"></i> Tagger (valgfritt)
                </div>
                <div class="tags-input-container" onclick="document.getElementById('tagsInput').focus()">
                    <div id="tagsContainer"></div>
                    <input type="text" id="tagsInput" class="tags-input" placeholder="Skriv og trykk Enter...">
                </div>
                <input type="hidden" name="tags" id="newsTags" value="[]">
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeNewsModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary" id="saveBtn">
                    <i class="fas fa-save"></i> Lagre artikkel
                </button>
            </div>
        </form>
    </div>
</div>

<script>
let currentNews = null;
let galleryImages = [];
let tags = [];

function showNewsModal(item = null) {
    currentNews = item;
    galleryImages = [];
    tags = [];
    
    document.getElementById('modalTitle').textContent = item ? 'Rediger artikkel' : 'Ny artikkel';
    document.getElementById('newsModal').style.display = 'block';
    
    // Reset image preview
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('imageUploadArea').classList.remove('has-image');
    
    if (item) {
        document.getElementById('newsId').value = item.id;
        document.getElementById('newsTitle').value = item.title || '';
        document.getElementById('newsDate').value = item.date || '';
        document.getElementById('newsCategory').value = item.category || '';
        document.getElementById('newsExcerpt').value = item.excerpt || '';
        document.getElementById('newsContent').value = item.content || '';
        document.getElementById('newsImage').value = item.image || '';
        document.getElementById('newsReadTime').value = item.readTime || '';
        document.getElementById('newsAuthor').value = item.author || '';
        
        // Show image preview if exists
        if (item.image) {
            document.getElementById('previewImg').src = item.image;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('imageUploadArea').classList.add('has-image');
        }
        
        // Load gallery
        if (item.gallery && Array.isArray(item.gallery)) {
            galleryImages = [...item.gallery];
            renderGalleryPreview();
        }
        
        // Load tags
        if (item.tags && Array.isArray(item.tags)) {
            tags = [...item.tags];
            renderTags();
        }
    } else {
        document.getElementById('newsForm').reset();
        document.getElementById('newsId').value = '';
        document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
        renderGalleryPreview();
        renderTags();
    }
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
    currentNews = null;
    galleryImages = [];
    tags = [];
}

function editNews(item) {
    showNewsModal(item);
}

async function deleteNews(id) {
    if (!confirm('Er du sikker på at du vil slette denne nyheten?')) return;
    
    try {
    const response = await fetch(`api/news.php?id=${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        location.reload();
        } else {
            alert('Kunne ikke slette nyhet: ' + (result.error || 'Ukjent feil'));
        }
    } catch (error) {
        alert('Feil ved sletting: ' + error.message);
    }
}

// Image upload functions
function triggerImageUpload() {
    if (!document.getElementById('imageUploadArea').classList.contains('has-image')) {
        document.getElementById('imageFile').click();
    }
}

async function handleImageUpload(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'news');
    
    // Show loading state
    document.getElementById('uploadPlaceholder').innerHTML = '<div class="upload-spinner"></div><div class="upload-text" style="margin-top: 1rem;">Laster opp...</div>';
    
    try {
        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('newsImage').value = result.url;
            document.getElementById('previewImg').src = result.url;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('imageUploadArea').classList.add('has-image');
        } else {
            throw new Error(result.error || 'Opplasting feilet');
        }
    } catch (error) {
        alert('Feil ved opplasting: ' + error.message);
        // Reset placeholder
        document.getElementById('uploadPlaceholder').innerHTML = `
            <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
            <div class="upload-text">Klikk for å laste opp bilde</div>
            <div class="upload-hint">JPG, PNG, GIF eller WEBP (maks 5MB)</div>
        `;
    }
    
    input.value = '';
}

function removeMainImage(event) {
    event.stopPropagation();
    document.getElementById('newsImage').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('imageUploadArea').classList.remove('has-image');
    // Reset placeholder content
    document.getElementById('uploadPlaceholder').innerHTML = `
        <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
        <div class="upload-text">Klikk for å laste opp bilde</div>
        <div class="upload-hint">JPG, PNG, GIF eller WEBP (maks 5MB)</div>
    `;
}

// Gallery functions
function triggerGalleryUpload() {
    document.getElementById('galleryFile').click();
}

async function handleGalleryUpload(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'news');
    
    try {
        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            galleryImages.push(result.url);
            renderGalleryPreview();
        } else {
            throw new Error(result.error || 'Opplasting feilet');
        }
    } catch (error) {
        alert('Feil ved opplasting: ' + error.message);
    }
    
    input.value = '';
}

function removeGalleryImage(index) {
    galleryImages.splice(index, 1);
    renderGalleryPreview();
}

function renderGalleryPreview() {
    const container = document.getElementById('galleryPreview');
    let html = '';
    
    galleryImages.forEach((url, index) => {
        html += `
            <div class="gallery-item">
                <img src="${url}" alt="Gallery image ${index + 1}">
                <button type="button" class="remove-gallery-image" onclick="removeGalleryImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    html += `
        <button type="button" class="add-gallery-btn" onclick="triggerGalleryUpload()">
            <i class="fas fa-plus"></i>
            <span>Legg til</span>
        </button>
    `;
    
    container.innerHTML = html;
    document.getElementById('newsGallery').value = JSON.stringify(galleryImages);
}

// Tags functions
document.getElementById('tagsInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = this.value.trim().replace(/,/g, '');
        if (value && !tags.includes(value)) {
            tags.push(value);
            renderTags();
        }
        this.value = '';
    } else if (e.key === 'Backspace' && !this.value && tags.length > 0) {
        tags.pop();
        renderTags();
    }
});

function removeTag(index) {
    tags.splice(index, 1);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('tagsContainer');
    container.innerHTML = tags.map((tag, index) => `
        <span class="tag-item">
            ${tag}
            <button type="button" onclick="removeTag(${index})">&times;</button>
        </span>
    `).join('');
    document.getElementById('newsTags').value = JSON.stringify(tags);
}

// Form submission
document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="upload-spinner" style="width: 16px; height: 16px;"></div> Lagrer...';
    
    try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
        
        // Parse gallery and tags from JSON
        data.gallery = JSON.parse(data.gallery || '[]');
        data.tags = JSON.parse(data.tags || '[]');
        
        // Clean up empty values
        if (!data.author) delete data.author;
        if (!data.content) delete data.content;
        if (!data.readTime) delete data.readTime;
        if (!data.image) delete data.image;
        if (data.gallery.length === 0) delete data.gallery;
        if (data.tags.length === 0) delete data.tags;
    
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
        } else {
            throw new Error(result.error || 'Kunne ikke lagre');
        }
    } catch (error) {
        alert('Feil ved lagring: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lagre artikkel';
    }
});
</script>
