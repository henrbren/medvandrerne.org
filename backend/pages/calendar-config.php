<?php
$config = readJsonFile(DATA_DIR . 'calendar_config.json', [
    'googleCalendarUrl' => '',
    'enabled' => false,
]);
?>

<div class="admin-page">
    <div class="info-box" style="margin-bottom: 2rem;">
        <h3><i class="fas fa-info-circle"></i> Google Calendar Integrasjon</h3>
        <p>Konfigurer Google Calendar ICS-feed for å synkronisere aktiviteter automatisk.</p>
        <ol style="margin-top: 1rem; padding-left: 1.5rem;">
            <li>Gå til Google Calendar</li>
            <li>Klikk på "Innstillinger" ved siden av kalenderen du vil dele</li>
            <li>Scroll ned til "Integrer kalender"</li>
            <li>Kopier "Offentlig URL i iCal-format"</li>
            <li>Lim inn URL-en nedenfor</li>
        </ol>
        <p style="margin-top: 1rem;"><strong>Eksempel URL:</strong> <code>https://calendar.google.com/calendar/ical/example%40gmail.com/public/basic.ics</code></p>
    </div>

    <form id="calendarConfigForm" class="admin-form">
        <div class="form-group">
            <label>
                <input type="checkbox" name="enabled" id="calendarEnabled" <?= $config['enabled'] ? 'checked' : '' ?>>
                Aktiver Google Calendar synkronisering
            </label>
        </div>

        <div class="form-group">
            <label>Google Calendar ICS URL</label>
            <input 
                type="url" 
                name="googleCalendarUrl" 
                id="calendarUrl" 
                value="<?= htmlspecialchars($config['googleCalendarUrl']) ?>"
                placeholder="https://calendar.google.com/calendar/ical/..."
            >
            <small style="display: block; margin-top: 0.5rem; color: var(--gray);">
                Offentlig URL i iCal-format fra Google Calendar
            </small>
        </div>

        <div class="form-group">
            <button type="button" class="btn btn-secondary" onclick="testCalendar()">
                <i class="fas fa-sync"></i> Test kalender-tilkobling
            </button>
        </div>

        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lagre innstillinger
        </button>
    </form>

    <div id="testResult" style="margin-top: 2rem; display: none;"></div>
</div>

<script>
async function testCalendar() {
    const url = document.getElementById('calendarUrl').value;
    const resultDiv = document.getElementById('testResult');
    
    if (!url) {
        resultDiv.innerHTML = '<div class="info-box" style="color: var(--warning);">Vennligst oppgi en URL først</div>';
        resultDiv.style.display = 'block';
        return;
    }
    
    resultDiv.innerHTML = '<div class="info-box">Tester kalender-tilkobling...</div>';
    resultDiv.style.display = 'block';
    
    try {
        const response = await fetch('api/test-calendar.php?url=' + encodeURIComponent(url));
        const result = await response.json();
        
        if (result.success) {
            let debugInfo = '';
            if (result.debug) {
                debugInfo = `
                    <details style="margin-top: 1rem;" open>
                        <summary style="cursor: pointer; color: var(--text-secondary);">Debug-info</summary>
                        <div style="margin-top: 0.5rem; padding: 1rem; background: var(--bg-muted); border-radius: 8px; font-size: 0.8rem;">
                            <p><strong>ICS-lengde:</strong> ${result.debug.ics_length} bytes</p>
                            <p><strong>Innholdstype:</strong> ${result.debug.content_type || 'ukjent'} ${result.debug.is_html ? '⚠️ Dette er en HTML-side, ikke en ICS-fil!' : ''}</p>
                            <p><strong>Har VCALENDAR:</strong> ${result.debug.has_vcalendar ? '✅ Ja' : '❌ Nei'}</p>
                            <p><strong>VEVENT i rådata:</strong> ${result.debug.vevent_count_in_raw || 0} stk</p>
                            <p><strong>Parset av parser:</strong> ${result.debug.total_events_parsed} hendelser</p>
                            <p><strong>I dag:</strong> ${result.debug.today}</p>
                            
                            ${result.debug.is_html ? `
                                <div style="margin-top: 1rem; padding: 1rem; background: #FFEBEE; border-radius: 8px; color: #C62828;">
                                    <strong>⚠️ Feil URL!</strong><br>
                                    Du bruker sannsynligvis en vanlig Google Calendar-lenke, ikke ICS-feeden.<br><br>
                                    <strong>Riktig format:</strong><br>
                                    <code>https://calendar.google.com/calendar/ical/KALENDER_ID/public/basic.ics</code><br><br>
                                    <strong>Slik finner du riktig URL:</strong><br>
                                    1. Gå til calendar.google.com<br>
                                    2. Klikk på tannhjulet ved siden av kalenderen<br>
                                    3. Velg "Innstillinger og deling"<br>
                                    4. Scroll ned til "Integrer kalender"<br>
                                    5. Kopier "Offentlig URL i iCal-format"
                                </div>
                            ` : ''}
                            
                            <p style="margin-top: 0.5rem;"><strong>Rå data (første 500 tegn):</strong></p>
                            <pre style="font-size: 0.6rem; overflow-x: auto; white-space: pre-wrap; background: #1a1a1a; color: #00ff00; padding: 0.5rem; border-radius: 4px; max-height: 200px;">${(result.debug.raw_start || '').substring(0, 500)}</pre>
                            
                            ${result.debug.sample_vevent ? `
                                <p style="margin-top: 0.5rem;"><strong>Eksempel VEVENT:</strong></p>
                                <pre style="font-size: 0.65rem; overflow-x: auto; white-space: pre-wrap; background: #000; color: #0f0; padding: 0.5rem; border-radius: 4px;">${result.debug.sample_vevent}</pre>
                            ` : ''}
                        </div>
                    </details>
                `;
            }
            
            resultDiv.innerHTML = `
                <div class="info-box" style="background: #E8F5E9; border-left-color: var(--success);">
                    <h4 style="color: var(--success); margin-bottom: 0.5rem;">
                        <i class="fas fa-check-circle"></i> Kalender-tilkobling fungerer!
                    </h4>
                    <p>Fant ${result.eventCount} fremtidige aktivitet(er) i kalenderen${result.totalParsed ? ` (${result.totalParsed} totalt)` : ''}.</p>
                    ${result.events && result.events.length > 0 ? `
                        <ul style="margin-top: 1rem; padding-left: 1.5rem;">
                            ${result.events.slice(0, 5).map(e => `<li>${e.title} - ${e.date}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${debugInfo}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="info-box" style="background: #FFEBEE; border-left-color: var(--danger);">
                    <h4 style="color: var(--danger); margin-bottom: 0.5rem;">
                        <i class="fas fa-exclamation-circle"></i> Feil ved kalender-tilkobling
                    </h4>
                    <p>${result.error || 'Ukjent feil'}</p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="info-box" style="background: #FFEBEE; border-left-color: var(--danger);">
                <h4 style="color: var(--danger); margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-circle"></i> Feil ved testing
                </h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

document.getElementById('calendarConfigForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        enabled: document.getElementById('calendarEnabled').checked,
        googleCalendarUrl: formData.get('googleCalendarUrl'),
    };
    
    const response = await fetch('api/save-calendar-config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
        alert('Innstillinger lagret! Kalenderen vil oppdateres automatisk.');
        // Clear cache to force refresh
        await fetch('api/clear-calendar-cache.php', { method: 'POST' });
    } else {
        alert('Feil ved lagring: ' + (result.error || 'Ukjent feil'));
    }
});
</script>
