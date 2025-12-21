<?php
$admin = readJsonFile(JSON_ADMINISTRATION);

// Helper function to get full image URL
function getImageUrl($image) {
    if (empty($image)) return '';
    // If already a full URL, return as-is
    if (strpos($image, 'http://') === 0 || strpos($image, 'https://') === 0) {
        return $image;
    }
    // Otherwise, prepend base URL with uploads path
    return BASE_URL . 'uploads/administration/' . $image;
}
?>

<div class="admin-page">
    <div class="page-header">
        <h3><i class="fas fa-user-tie"></i> Ansatte</h3>
        <button class="btn btn-primary" onclick="showAdminModal()">
            <i class="fas fa-plus"></i> Legg til person
        </button>
    </div>

    <!-- Person Cards Grid -->
    <div class="persons-grid">
        <?php foreach ($admin as $index => $person): ?>
        <div class="person-card" data-id="<?= $person['id'] ?>">
            <button type="button" class="remove-btn" onclick="deleteAdmin(<?= $person['id'] ?>)" title="Slett">
                <i class="fas fa-times"></i>
            </button>
            <div class="person-image">
                <?php if (!empty($person['image'])): ?>
                    <img src="<?= htmlspecialchars(getImageUrl($person['image'])) ?>" alt="<?= htmlspecialchars($person['name']) ?>">
                <?php else: ?>
                    <i class="fas fa-user"></i>
                <?php endif; ?>
            </div>
            <div class="person-info">
                <h4><?= htmlspecialchars($person['name']) ?></h4>
                <span class="person-role"><?= htmlspecialchars($person['role']) ?></span>
                <?php if (!empty($person['email'])): ?>
                <a href="mailto:<?= htmlspecialchars($person['email']) ?>" class="person-email">
                    <?= htmlspecialchars($person['email']) ?>
                </a>
                <?php endif; ?>
                <?php if (!empty($person['phone'])): ?>
                <span class="person-phone"><?= htmlspecialchars($person['phone']) ?></span>
                <?php endif; ?>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="editAdmin(<?= htmlspecialchars(json_encode($person)) ?>)">
                <i class="fas fa-edit"></i> Rediger
            </button>
        </div>
        <?php endforeach; ?>
        
        <?php if (empty($admin)): ?>
        <div class="empty-state" style="grid-column: 1/-1;">
            <i class="fas fa-user-plus"></i>
            <h3>Ingen ansatte ennå</h3>
            <p>Klikk "Legg til person" for å legge til den første.</p>
        </div>
        <?php endif; ?>
    </div>
</div>

<!-- Admin Modal with Image Upload -->
<div id="adminModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="adminModalTitle">Legg til person</h3>
            <button class="modal-close" onclick="closeAdminModal()">&times;</button>
        </div>
        <form id="adminForm" class="admin-form">
            <input type="hidden" name="id" id="adminId">
            
            <!-- Image Upload Section -->
            <div class="form-group" style="text-align: center;">
                <div class="image-upload-wrapper" style="display: inline-block;">
                    <div class="image-preview" id="adminImagePreview" style="width: 120px; height: 120px; margin: 0 auto var(--space-3);">
                        <i class="fas fa-user"></i>
                    </div>
                    <input type="hidden" name="image" id="adminImage">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openImagePickerAdmin()">
                        <i class="fas fa-camera"></i> Velg bilde
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label>Rolle *</label>
                <input type="text" name="role" id="adminRole" required placeholder="F.eks. Daglig leder">
            </div>
            <div class="form-group">
                <label>Navn *</label>
                <input type="text" name="name" id="adminName" required placeholder="Fullt navn">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" name="phone" id="adminPhone" placeholder="+47 123 45 678">
                </div>
                <div class="form-group">
                    <label>E-post</label>
                    <input type="email" name="email" id="adminEmail" placeholder="navn@medvandrerne.no">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeAdminModal()">Avbryt</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Lagre
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Image Picker Modal (reuse from board) -->
<div id="imagePickerModalAdmin" class="modal">
    <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
            <h3>Velg eller last opp bilde</h3>
            <button class="modal-close" onclick="closeImagePickerAdmin()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="upload-section">
                <label class="upload-dropzone" id="uploadDropzoneAdmin">
                    <input type="file" id="imageFileInputAdmin" accept="image/*" style="display: none;">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Dra og slipp, eller klikk for å laste opp</span>
                    <small>Maks 5 MB · JPG, PNG, GIF, WEBP</small>
                </label>
                <div id="uploadProgressAdmin" class="upload-progress" style="display: none;">
                    <div class="progress-bar"></div>
                    <span>Laster opp...</span>
                </div>
            </div>
            <div class="existing-images">
                <h4>Eksisterende bilder</h4>
                <div id="imageGalleryAdmin" class="image-gallery">
                    <div class="loading"><i class="fas fa-spinner fa-spin"></i> Laster bilder...</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.persons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
}

.person-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    text-align: center;
    position: relative;
    transition: all var(--duration-fast);
}

.person-card:hover {
    border-color: var(--brand);
    box-shadow: var(--shadow-md);
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

.person-card:hover .remove-btn {
    opacity: 1;
}

.remove-btn:hover {
    background: var(--error);
    color: white;
}

.person-image {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-full);
    background: var(--bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-4);
    overflow: hidden;
    border: 3px solid var(--border-default);
}

.person-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.person-image i {
    font-size: 2.5rem;
    color: var(--text-muted);
}

.person-info h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: var(--space-1);
}

.person-role {
    display: block;
    font-size: 0.8125rem;
    color: var(--brand);
    font-weight: 500;
    margin-bottom: var(--space-2);
}

.person-email {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-decoration: none;
    margin-bottom: var(--space-1);
}

.person-email:hover {
    color: var(--brand);
}

.person-phone {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-5);
}

.page-header h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
}

/* Reuse styles from board.php */
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

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-preview i {
    font-size: 2rem;
    color: var(--text-muted);
}

.upload-section {
    margin-bottom: var(--space-5);
}

.upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
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

.upload-dropzone i {
    font-size: 2rem;
    color: var(--text-muted);
    margin-bottom: var(--space-2);
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
    max-height: 250px;
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

.empty-state {
    text-align: center;
    padding: var(--space-12);
}

.empty-state i {
    font-size: 3rem;
    color: var(--text-muted);
    margin-bottom: var(--space-4);
}
</style>

<script>
let currentAdmin = null;

function showAdminModal(item = null) {
    currentAdmin = item;
    document.getElementById('adminModalTitle').textContent = item ? 'Rediger person' : 'Legg til person';
    document.getElementById('adminModal').classList.add('show');
    
    if (item) {
        document.getElementById('adminId').value = item.id;
        document.getElementById('adminRole').value = item.role || '';
        document.getElementById('adminName').value = item.name || '';
        document.getElementById('adminPhone').value = item.phone || '';
        document.getElementById('adminEmail').value = item.email || '';
        document.getElementById('adminImage').value = item.image || '';
        
        // Update preview
        const preview = document.getElementById('adminImagePreview');
        if (item.image) {
            preview.innerHTML = `<img src="${item.image}" alt="Preview">`;
        } else {
            preview.innerHTML = '<i class="fas fa-user"></i>';
        }
    } else {
        document.getElementById('adminForm').reset();
        document.getElementById('adminId').value = '';
        document.getElementById('adminImage').value = '';
        document.getElementById('adminImagePreview').innerHTML = '<i class="fas fa-user"></i>';
    }
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('show');
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
}

// Image Picker for Administration
function openImagePickerAdmin() {
    document.getElementById('imagePickerModalAdmin').classList.add('show');
    loadExistingImagesAdmin();
}

function closeImagePickerAdmin() {
    document.getElementById('imagePickerModalAdmin').classList.remove('show');
}

function selectImageAdmin(url) {
    document.getElementById('adminImage').value = url;
    document.getElementById('adminImagePreview').innerHTML = `<img src="${url}" alt="Preview">`;
    closeImagePickerAdmin();
    Toast.success('Bilde valgt');
}

async function loadExistingImagesAdmin() {
    const gallery = document.getElementById('imageGalleryAdmin');
    gallery.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Laster...</div>';
    
    try {
        const response = await fetch('api/images.php?category=administration');
        const images = await response.json();
        
        if (images.length === 0) {
            gallery.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Ingen bilder ennå</p>';
            return;
        }
        
        gallery.innerHTML = images.map(img => `
            <div class="gallery-item" onclick="selectImageAdmin('${img.url}')">
                <img src="${img.url}" alt="${img.filename}" loading="lazy">
            </div>
        `).join('');
    } catch (error) {
        gallery.innerHTML = '<p style="color: var(--error);">Kunne ikke laste bilder</p>';
    }
}

// Upload handling
const dropzoneAdmin = document.getElementById('uploadDropzoneAdmin');
const fileInputAdmin = document.getElementById('imageFileInputAdmin');

dropzoneAdmin.addEventListener('click', () => fileInputAdmin.click());

dropzoneAdmin.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneAdmin.classList.add('dragover');
});

dropzoneAdmin.addEventListener('dragleave', () => {
    dropzoneAdmin.classList.remove('dragover');
});

dropzoneAdmin.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneAdmin.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        uploadImageAdmin(e.dataTransfer.files[0]);
    }
});

fileInputAdmin.addEventListener('change', () => {
    if (fileInputAdmin.files.length) {
        uploadImageAdmin(fileInputAdmin.files[0]);
    }
});

async function uploadImageAdmin(file) {
    const progress = document.getElementById('uploadProgressAdmin');
    progress.style.display = 'flex';
    dropzoneAdmin.style.display = 'none';
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'administration');
    
    try {
        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            selectImageAdmin(result.url);
            Toast.success('Bilde lastet opp!');
        } else {
            Toast.error(result.error || 'Opplasting feilet');
        }
    } catch (error) {
        Toast.error('Kunne ikke laste opp bilde');
    } finally {
        progress.style.display = 'none';
        dropzoneAdmin.style.display = 'flex';
        fileInputAdmin.value = '';
    }
}

// Close modals on backdrop click
document.getElementById('adminModal').addEventListener('click', (e) => {
    if (e.target.id === 'adminModal') closeAdminModal();
});
document.getElementById('imagePickerModalAdmin').addEventListener('click', (e) => {
    if (e.target.id === 'imagePickerModalAdmin') closeImagePickerAdmin();
});

// Form submit
document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Get the image value from the hidden field (might have been set by image picker)
    const imageValue = document.getElementById('adminImage').value;
    
    try {
        // Fetch current admin list
        const response = await fetch('api/administration.php');
        if (!response.ok) throw new Error('Kunne ikke hente data');
        const admin = await response.json();
        
        console.log('Current admin data:', admin);
        console.log('Form data:', data);
        console.log('Image value:', imageValue);
        
        if (data.id) {
            // Editing existing person
            const id = parseInt(data.id);
            const index = admin.findIndex(a => a.id === id);
            
            if (index !== -1) {
                // Only update fields that have values
                const updatedPerson = { ...admin[index] };
                
                if (data.role) updatedPerson.role = data.role;
                if (data.name) updatedPerson.name = data.name;
                if (data.phone !== undefined) updatedPerson.phone = data.phone;
                if (data.email !== undefined) updatedPerson.email = data.email;
                if (imageValue) updatedPerson.image = imageValue;
                
                admin[index] = updatedPerson;
                console.log('Updated person:', updatedPerson);
            }
        } else {
            // Adding new person
            const newId = admin.length > 0 ? Math.max(...admin.map(a => a.id || 0)) + 1 : 1;
            const newPerson = {
                id: newId,
                role: data.role || '',
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                image: imageValue || ''
            };
            admin.push(newPerson);
            console.log('New person:', newPerson);
        }
        
        console.log('Saving admin data:', admin);
        await saveData('administration', admin);
        closeAdminModal();
    } catch (error) {
        console.error('Error saving:', error);
        Toast.error('Kunne ikke lagre: ' + error.message);
    }
});
</script>

