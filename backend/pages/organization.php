<?php
$data = readJsonFile(JSON_ORGANIZATION, [
    'name' => 'Stiftelsen Medvandrerne',
    'orgNumber' => '929 447 999',
    'bankAccount' => '1506 76 74992',
    'website' => 'https://www.medvandrerne.org',
    'address' => 'Krokoddveien 18, 3440 RØYKEN',
    'municipality' => 'ASKER',
    'vipps' => '792526',
    'spleis' => 'https://spleis.no/medvandrerne',
]);
?>

<div class="admin-page">
    <form id="organizationForm" class="admin-form">
        <div class="form-group">
            <label>Organisasjonsnavn</label>
            <input type="text" name="name" value="<?= htmlspecialchars($data['name'] ?? '') ?>" required>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Organisasjonsnummer</label>
                <input type="text" name="orgNumber" value="<?= htmlspecialchars($data['orgNumber'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Kommune</label>
                <input type="text" name="municipality" value="<?= htmlspecialchars($data['municipality'] ?? '') ?>">
            </div>
        </div>

        <div class="form-group">
            <label>Adresse</label>
            <input type="text" name="address" value="<?= htmlspecialchars($data['address'] ?? '') ?>">
        </div>

        <div class="form-group">
            <label>Kontonummer</label>
            <input type="text" name="bankAccount" value="<?= htmlspecialchars($data['bankAccount'] ?? '') ?>">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>VIPPS-nummer</label>
                <input type="text" name="vipps" value="<?= htmlspecialchars($data['vipps'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Nettsted</label>
                <input type="url" name="website" value="<?= htmlspecialchars($data['website'] ?? '') ?>">
            </div>
        </div>

        <div class="form-group">
            <label>Spleis-lenke</label>
            <input type="url" name="spleis" value="<?= htmlspecialchars($data['spleis'] ?? '') ?>">
        </div>

        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lagre endringer
        </button>
    </form>
</div>

<script>
document.getElementById('organizationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    await saveData('organization', data);
});
</script>
