<?php
$board = readJsonFile(JSON_BOARD, [
    'leader' => '',
    'leaderImage' => null,
    'members' => []
]);
?>

<div class="admin-page">
    <form id="boardForm" class="admin-form">
        <!-- Styreleder -->
        <div class="person-card leader-card">
            <h3><i class="fas fa-crown"></i> Styreleder</h3>
            <div class="person-content">
                <div class="image-upload-wrapper" data-target="leaderImage">
                    <div class="image-preview" id="leaderImagePreview">
                        <?php if (!empty($board['leaderImage'])): ?>
                            <img src="<?= htmlspecialchars($board['leaderImage']) ?>" alt="Styreleder">
                        <?php else: ?>
                            <i class="fas fa-user"></i>
                        <?php endif; ?>
                    </div>
                    <input type="hidden" name="leaderImage" id="leaderImage" value="<?= htmlspecialchars($board['leaderImage'] ?? '') ?>">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openImagePicker('leaderImage', 'board')">
                        <i class="fas fa-camera"></i> Velg bilde
                    </button>
                </div>
                <div class="person-info">
                    <div class="form-group">
                        <label>Navn</label>
                        <input type="text" name="leader" value="<?= htmlspecialchars($board['leader'] ?? '') ?>" placeholder="Fullt navn">
                    </div>
                </div>
            </div>
        </div>

        <!-- Styremedlemmer -->
        <div class="section-header">
            <h3><i class="fas fa-users"></i> Styremedlemmer</h3>
            <button type="button" class="btn btn-primary btn-sm" onclick="addMember()">
                <i class="fas fa-plus"></i> Legg til
            </button>
        </div>
        
        <div id="boardMembers" class="members-grid">
            <?php foreach ($board['members'] ?? [] as $index => $member): ?>
            <div class="person-card member-card" data-index="<?= $index ?>">
                <button type="button" class="remove-btn" onclick="removeMember(this)" title="Fjern">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-upload-wrapper" data-target="memberImage_<?= $index ?>">
                    <div class="image-preview" id="memberImage_<?= $index ?>Preview">
                        <?php if (!empty($member['image'])): ?>
                            <img src="<?= htmlspecialchars($member['image']) ?>" alt="<?= htmlspecialchars($member['name'] ?? '') ?>">
                        <?php else: ?>
                            <i class="fas fa-user"></i>
                        <?php endif; ?>
                    </div>
                    <input type="hidden" name="members[<?= $index ?>][image]" id="memberImage_<?= $index ?>" value="<?= htmlspecialchars($member['image'] ?? '') ?>">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="openImagePicker('memberImage_<?= $index ?>', 'board')">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="form-group">
                    <input type="text" name="members[<?= $index ?>][name]" value="<?= htmlspecialchars($member['name'] ?? '') ?>" placeholder="Navn">
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Lagre endringer
            </button>
        </div>
    </form>
</div>

<!-- Image Picker Modal -->
<div id="imagePickerModal" class="modal">
    <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
            <h3>Velg eller last opp bilde</h3>
            <button class="modal-close" onclick="closeImagePicker()">&times;</button>
        </div>
        <div class="modal-body">
            <!-- Upload Section -->
            <div class="upload-section">
                <label class="upload-dropzone" id="uploadDropzone">
                    <input type="file" id="imageFileInput" accept="image/*" style="display: none;">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Dra og slipp, eller klikk for å laste opp</span>
                    <small>Maks 5 MB · JPG, PNG, GIF, WEBP</small>
                </label>
                <div id="uploadProgress" class="upload-progress" style="display: none;">
                    <div class="progress-bar"></div>
                    <span>Laster opp...</span>
                </div>
            </div>
            
            <!-- Existing Images -->
            <div class="existing-images">
                <h4>Eksisterende bilder</h4>
                <div id="imageGallery" class="image-gallery">
                    <div class="loading"><i class="fas fa-spinner fa-spin"></i> Laster bilder...</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.person-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    margin-bottom: var(--space-4);
    position: relative;
}

.leader-card {
    background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-subtle) 100%);
    border: 2px solid var(--brand);
}

.leader-card h3 {
    color: var(--brand);
    margin-bottom: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.person-content {
    display: flex;
    gap: var(--space-5);
    align-items: flex-start;
}

.person-info {
    flex: 1;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: var(--space-6) 0 var(--space-4);
}

.section-header h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
}

.member-card {
    text-align: center;
    padding: var(--space-4);
}

.remove-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    border: none;
    background: var(--bg-muted);
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: all var(--duration-fast);
}

.member-card:hover .remove-btn {
    opacity: 1;
}

.remove-btn:hover {
    background: var(--error);
    color: white;
}

.image-upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
}

.image-preview {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-full);
    background: var(--bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid var(--border-default);
}

.leader-card .image-preview {
    width: 120px;
    height: 120px;
    border-color: var(--brand);
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-preview i {
    font-size: 2rem;
    color: var(--text-muted);
}

.form-actions {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-subtle);
}

/* Upload Modal Styles */
.upload-section {
    margin-bottom: var(--space-5);
}

.upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    border: 2px dashed var(--border-default);
    border-radius: var(--radius-lg);
    background: var(--bg-subtle);
    cursor: pointer;
    transition: all var(--duration-fast);
    text-align: center;
}

.upload-dropzone:hover {
    border-color: var(--brand);
    background: rgba(229, 57, 53, 0.05);
}

.upload-dropzone.dragover {
    border-color: var(--brand);
    background: rgba(229, 57, 53, 0.1);
}

.upload-dropzone i {
    font-size: 2.5rem;
    color: var(--text-muted);
    margin-bottom: var(--space-3);
}

.upload-dropzone span {
    color: var(--text-secondary);
    font-weight: 500;
}

.upload-dropzone small {
    color: var(--text-muted);
    margin-top: var(--space-2);
}

.upload-progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-subtle);
    border-radius: var(--radius-md);
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: var(--bg-muted);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress-bar::after {
    content: '';
    display: block;
    width: 50%;
    height: 100%;
    background: var(--brand);
    animation: progress 1s ease infinite;
}

@keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
}

.existing-images h4 {
    margin-bottom: var(--space-3);
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-3);
    max-height: 300px;
    overflow-y: auto;
}

.gallery-item {
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all var(--duration-fast);
}

.gallery-item:hover {
    border-color: var(--brand);
    transform: scale(1.05);
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.modal-body {
    padding: var(--space-5);
}
</style>

<script>
let memberIndex = <?= count($board['members'] ?? []) ?>;
let currentImageTarget = null;
let currentCategory = 'board';

function addMember() {
    const container = document.getElementById('boardMembers');
    const card = document.createElement('div');
    card.className = 'person-card member-card';
    card.dataset.index = memberIndex;
    card.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeMember(this)" title="Fjern">
            <i class="fas fa-times"></i>
        </button>
        <div class="image-upload-wrapper" data-target="memberImage_${memberIndex}">
            <div class="image-preview" id="memberImage_${memberIndex}Preview">
                <i class="fas fa-user"></i>
            </div>
            <input type="hidden" name="members[${memberIndex}][image]" id="memberImage_${memberIndex}" value="">
            <button type="button" class="btn btn-ghost btn-sm" onclick="openImagePicker('memberImage_${memberIndex}', 'board')">
                <i class="fas fa-camera"></i>
            </button>
        </div>
        <div class="form-group">
            <input type="text" name="members[${memberIndex}][name]" placeholder="Navn">
        </div>
    `;
    container.appendChild(card);
    memberIndex++;
    
    // Animate in
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    requestAnimationFrame(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    });
}

function removeMember(btn) {
    const card = btn.closest('.member-card');
    card.style.transition = 'all 0.2s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(() => card.remove(), 200);
}

// Image Picker
function openImagePicker(targetId, category) {
    currentImageTarget = targetId;
    currentCategory = category;
    document.getElementById('imagePickerModal').classList.add('show');
    loadExistingImages(category);
}

function closeImagePicker() {
    document.getElementById('imagePickerModal').classList.remove('show');
    currentImageTarget = null;
}

function selectImage(url) {
    if (!currentImageTarget) return;
    
    // Update hidden input
    document.getElementById(currentImageTarget).value = url;
    
    // Update preview
    const preview = document.getElementById(currentImageTarget + 'Preview');
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
    
    closeImagePicker();
    Toast.success('Bilde valgt');
}

async function loadExistingImages(category) {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Laster bilder...</div>';
    
    try {
        const response = await fetch(`api/images.php?category=${category}`);
        const images = await response.json();
        
        if (images.length === 0) {
            gallery.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: var(--space-4);">Ingen bilder ennå. Last opp et nytt bilde ovenfor.</p>';
            return;
        }
        
        gallery.innerHTML = images.map(img => `
            <div class="gallery-item" onclick="selectImage('${img.url}')">
                <img src="${img.url}" alt="${img.filename}" loading="lazy">
            </div>
        `).join('');
    } catch (error) {
        gallery.innerHTML = '<p style="color: var(--error);">Kunne ikke laste bilder</p>';
    }
}

// Upload handling
const dropzone = document.getElementById('uploadDropzone');
const fileInput = document.getElementById('imageFileInput');

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        uploadImage(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        uploadImage(fileInput.files[0]);
    }
});

async function uploadImage(file) {
    const progress = document.getElementById('uploadProgress');
    progress.style.display = 'flex';
    dropzone.style.display = 'none';
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', currentCategory);
    
    try {
        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            selectImage(result.url);
            Toast.success('Bilde lastet opp!');
            if (typeof Confetti !== 'undefined') {
                Confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 20);
            }
        } else {
            Toast.error(result.error || 'Opplasting feilet');
        }
    } catch (error) {
        Toast.error('Kunne ikke laste opp bilde');
    } finally {
        progress.style.display = 'none';
        dropzone.style.display = 'flex';
        fileInput.value = '';
    }
}

// Close modal on backdrop click
document.getElementById('imagePickerModal').addEventListener('click', (e) => {
    if (e.target.id === 'imagePickerModal') closeImagePicker();
});

// Form submit
document.getElementById('boardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        leader: formData.get('leader'),
        leaderImage: formData.get('leaderImage') || null,
        members: []
    };
    
    // Collect all member cards
    document.querySelectorAll('.member-card').forEach((card, i) => {
        const nameInput = card.querySelector('input[type="text"]');
        const imageInput = card.querySelector('input[type="hidden"]');
        if (nameInput) {
            data.members.push({
                name: nameInput.value,
                image: imageInput ? imageInput.value : null
            });
        }
    });
    
    await saveData('board', data);
});
</script>
