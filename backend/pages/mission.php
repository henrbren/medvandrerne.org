<?php
$data = readJsonFile(JSON_MISSION, [
    'title' => 'Om Medvandrerne',
    'description' => '',
    'nature' => '',
    'equality' => '',
    'responsibility' => '',
]);
?>

<div class="admin-page">
    <form id="missionForm" class="admin-form">
        <div class="form-group">
            <label>Tittel</label>
            <input type="text" name="title" value="<?= htmlspecialchars($data['title'] ?? '') ?>" required>
        </div>

        <div class="form-group">
            <label>Beskrivelse</label>
            <textarea name="description" rows="4"><?= htmlspecialchars($data['description'] ?? '') ?></textarea>
        </div>

        <div class="form-group">
            <label>Naturen</label>
            <textarea name="nature" rows="4"><?= htmlspecialchars($data['nature'] ?? '') ?></textarea>
        </div>

        <div class="form-group">
            <label>Likestilling</label>
            <textarea name="equality" rows="4"><?= htmlspecialchars($data['equality'] ?? '') ?></textarea>
        </div>

        <div class="form-group">
            <label>Ansvar</label>
            <textarea name="responsibility" rows="4"><?= htmlspecialchars($data['responsibility'] ?? '') ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lagre endringer
        </button>
    </form>
</div>

<script>
document.getElementById('missionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    await saveData('mission', data);
});
</script>

