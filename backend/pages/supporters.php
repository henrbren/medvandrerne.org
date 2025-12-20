<?php
$supporters = readJsonFile(JSON_SUPPORTERS, [
    'financial' => [],
    'partners' => [],
    'friends' => []
]);
?>

<div class="admin-page">
    <form id="supportersForm" class="admin-form">
        <div class="form-group">
            <label>Finansielle støttespillere (én per linje)</label>
            <textarea name="financial" rows="6"><?= htmlspecialchars(implode("\n", $supporters['financial'] ?? [])) ?></textarea>
        </div>

        <div class="form-group">
            <label>Partnere (én per linje)</label>
            <textarea name="partners" rows="6"><?= htmlspecialchars(implode("\n", $supporters['partners'] ?? [])) ?></textarea>
        </div>

        <div class="form-group">
            <label>Venner og samarbeidspartnere (én per linje)</label>
            <textarea name="friends" rows="10"><?= htmlspecialchars(implode("\n", $supporters['friends'] ?? [])) ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lagre endringer
        </button>
    </form>
</div>

<script>
document.getElementById('supportersForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        financial: formData.get('financial').split('\n').filter(s => s.trim()),
        partners: formData.get('partners').split('\n').filter(s => s.trim()),
        friends: formData.get('friends').split('\n').filter(s => s.trim())
    };
    await saveData('supporters', data);
});
</script>
