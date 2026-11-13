/* =========================================================
   ทุ่งพระวาจา — Enhancements & Cross-Platform Notifications
   1. Credits Accordion (+ / –) & Auto-open from Today link
   2. Saint Symbol Frame & Caption Enhancer (Mobile & Desktop)
   3. Cross-Browser / PWA / In-App Notification Scheduler
   ========================================================= */
(() => {
  // ---------------------------------------------------------
  // 1. กด "ดูที่มาและเครดิตทั้งหมด" จากหน้าแรก -> เปิดแท็บ + กางกล่องเครดิตอัตโนมัติ
  // ---------------------------------------------------------
  const goCredBtn = document.getElementById('goCredits');
  if (goCredBtn) {
    goCredBtn.addEventListener('click', () => {
      const cateTab = document.getElementById('tab-cate');
      if (cateTab) cateTab.click();
      setTimeout(() => {
        const credBox = document.getElementById('cardCredits');
        if (credBox) {
          if (credBox.tagName === 'DETAILS') credBox.open = true;
          credBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    });
  }

  // ---------------------------------------------------------
  // 2. เพิ่มคำอธิบายสัญลักษณ์ในการ์ด "ฉลองวันเดียวกัน" และล็อก SVG ให้อยู่ในกรอบ
  // ---------------------------------------------------------
  function guessSymbolCaption(name, bio) {
    const text = `${name} ${bio}`;
    if (/พระสันตะปาปา/.test(text)) return 'มาลา · ไม้กางเขน';
    if (/มรณสักขี|ถูกประหาร|ตรึงกางเขน|เผา|ตัดศีรษะ/.test(text)) return 'ไม้กางเขน · ใบปาล์ม';
    if (/พระสังฆราช|อาร์ชบิชอป|พระคาร์ดินัล|พระอัยกา/.test(text)) return 'ไม้เท้า · ผ้าคลุม';
    if (/แม่พระ|พระนางมารีย์/.test(text)) return 'ดาวสิบสองดวง · ดอกลิลลี่';
    if (/นักปราชญ์|เขียน|หนังสือ|คำสอน|จดหมาย/.test(text)) return 'หนังสือ · ปากกาขนนก';
    if (/กษัตริย์|ราชินี|เจ้าชาย|เจ้าหญิง|จักรพรรดิ/.test(text)) return 'มงกุฎ · กางเขน';
    if (/พยาบาล|คนป่วย|คนยากจน|เมตตา/.test(text)) return 'ชามอาหาร · หัวใจ';
    if (/ทูตสวรรค์/.test(text)) return 'ปีก · แสงสว่าง';
    if (/ฤาษี|นักพรต|อธิการ|ซิสเตอร์/.test(text)) return 'กางเขน · ดอกลิลลี่';
    return 'สัญลักษณ์นักบุญ';
  }

  function enhanceSaintSymbols() {
    // ตรวจให้ <svg> ทุกตัวในกรอบ .spic ย่อขยายพอดีกรอบเสมอ
    document.querySelectorAll('.spic svg').forEach((svg) => {
      if (!svg.getAttribute('preserveAspectRatio')) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.maxWidth = '100%';
      svg.style.maxHeight = '100%';
    });

    // เพิ่มกรอบ + คำอธิบายสัญลักษณ์ให้นักบุญในกลุ่ม "ฉลองวันเดียวกัน" (#stOthers)
    const others = document.getElementById('stOthers');
    if (!others) return;

    others.querySelectorAll('.st-o').forEach((row) => {
      const oldPic = row.querySelector(':scope > .spic');
      if (!oldPic) return;

      const nameEl = row.querySelector('h3, b');
      const bioEl = row.querySelector('.sbio');
      const caption = guessSymbolCaption(
        nameEl ? nameEl.textContent : '',
        bioEl ? bioEl.textContent : ''
      );

      const fig = document.createElement('figure');
      fig.className = 'sframe sm';
      fig.style.margin = '0';

      oldPic.classList.remove('sm');
      const cap = document.createElement('figcaption');
      cap.textContent = caption;

      fig.appendChild(oldPic);
      fig.appendChild(cap);
      row.insertBefore(fig, row.firstChild);
    });
  }

  const saintCard = document.querySelector('.card.saint');
  if (saintCard) {
    enhanceSaintSymbols();
    const obs = new MutationObserver(() => enhanceSaintSymbols());
    obs.observe(saintCard, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------
  // 3. ระบบแจ้งเตือนผ่านทุกเบราว์เซอร์และแอป (PWA + Web + In-App)
  // ---------------------------------------------------------
  const NOTI_STORAGE_KEY = 'tungprawaja_noti_v2';
  const DEFAULT_NOTI = {
    enabled: false,
    sound: true,
    slots: [
      { id: 'morning', label: 'ภาวนายามเช้า', time: '07:00', on: true },
      { id: 'mercy', label: 'พระเมตตา บ่ายสามโมง', time: '15:00', on: true },
      { id: 'evening', label: 'อ่านพระคัมภีร์ & สายประคำ', time: '20:00', on: true }
    ],
    sentLog: {}
  };

  function loadNoti() {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTI_STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.slots)) return Object.assign({}, DEFAULT_NOTI, saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_NOTI));
  }

  function saveNoti(cfg) {
    try {
      localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {}
  }

  function isInAppBrowser() {
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line\/|Twitter|MicroMessenger/i.test(ua);
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  // เสียงระฆังเบา ๆ เมื่อแจ้งเตือนทำงานขณะเปิดหน้าเว็บอยู่
  function playGentleChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
  }

  function showToast(title, body) {
    const old = document.getElementById('tpwToast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'tpwToast';
    el.className = 'tpw-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div><b>🔔 ${title}</b><span>${body}</span></div><button type="button" aria-label="ปิด">✕</button>`;
    el.querySelector('button').onclick = () => el.remove();
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 7000);
  }

  async function fireNotification(title, body, tag = 'tungprawaja-daily') {
    const cfg = loadNoti();
    if (cfg.sound) playGentleChime();

    // 1. ส่งผ่าน Service Worker (Android Chrome, Edge, Samsung Internet, และแอป PWA)
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title, {
            body,
            icon: './icon-192.png',
            badge: './icon-192.png',
            vibrate: [180, 90, 180],
            tag,
            renotify: true
          });
          showToast(title, body);
          return true;
        }
      } catch (e) {}
    }

    // 2. Fallback ผ่าน Web Notification API มาตรฐาน
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: './icon-192.png', tag });
        showToast(title, body);
        return true;
      } catch (e) {}
    }

    // 3. Fallback แสดงแบนเนอร์ในแอป (กรณีเปิดใน LINE / Instagram)
    showToast(title, body);
    return false;
  }

  function renderNotiCard() {
    const box = document.getElementById('notiCard');
    if (!box) return;
    const cfg = loadNoti();

    let envNote = 'พร้อมส่งแจ้งเตือนบนเบราว์เซอร์และแอปที่เพิ่มลงหน้าจอหลัก';
    if (isInAppBrowser()) {
      envNote = '⚠️ กำลังเปิดในแอปอื่น (เช่น Instagram / LINE) — แนะนำกดจุด 3 จุดมุมขวาบน แล้วเลือก "เปิดใน Chrome / Safari" เพื่อรับแจ้งเตือนเต็มรูปแบบ';
    } else if (isIOS() && !isStandalone()) {
      envNote = '📱 สำหรับ iPhone / iPad: กดปุ่ม แชร์ (Share) ด้านล่าง แล้วเลือก "เพิ่มไปยังหน้าจอโฮม" ก่อนเปิดการแจ้งเตือนนะคะ';
    } else if (isStandalone()) {
      envNote = '✓ กำลังใช้งานในโหมดแอป (PWA) พร้อมรับแจ้งเตือนเต็มรูปแบบ';
    }

    box.innerHTML = `
      <div class="eyebrow"><span>การแจ้งเตือนประจำวัน</span><span class="typehead">reminders</span></div>
      <div class="noti-head">
        <span style="font-size:1.05rem;color:var(--cobalt)">🔔 เตือนอ่านพระคัมภีร์และสวดภาวนา</span>
        <button type="button" id="notiMasterBtn" class="pillbtn${cfg.enabled ? ' on' : ''}" style="min-height:38px;padding:6px 14px;font-size:.88rem">
          ${cfg.enabled ? '✓ เปิดแจ้งเตือนอยู่' : 'เปิดการแจ้งเตือน'}
        </button>
      </div>
      <div class="note" style="font-size:.82rem">${envNote}</div>
      <div class="noti-times">
        ${cfg.slots.map((s, idx) => `
          <div class="noti-slot">
            <label>
              <input type="checkbox" data-slot-on="${idx}" ${s.on ? 'checked' : ''}>
              <span>${s.label}</span>
            </label>
            <input type="time" data-slot-time="${idx}" value="${s.time}" aria-label="เวลาแจ้งเตือน ${s.label}">
          </div>
        `).join('')}
      </div>
      <div class="noti-btns">
        <button type="button" class="linkbtn" id="notiTestBtn">ทดสอบส่งแจ้งเตือนตอนนี้</button>
        <button type="button" class="linkbtn" id="notiSoundBtn">${cfg.sound ? '🔊 เสียงระฆัง: เปิด' : '🔇 เสียงระฆัง: ปิด'}</button>
      </div>
    `;

    document.getElementById('notiMasterBtn').onclick = async () => {
      const current = loadNoti();
      if (current.enabled) {
        current.enabled = false;
        saveNoti(current);
        renderNotiCard();
        return;
      }

      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          alert('กรุณากด "อนุญาต (Allow)" การแจ้งเตือนในเบราว์เซอร์ก่อนนะคะ (หากเปิดจาก LINE/IG ให้เปิดผ่าน Chrome หรือ Safari ก่อนค่ะ)');
        }
      }

      current.enabled = true;
      saveNoti(current);
      renderNotiCard();
      await fireNotification(
        'ทุ่งพระวาจา · เปิดการแจ้งเตือนแล้ว',
        'ระบบพร้อมเตือนเวลาสวดภาวนาและอ่านพระคัมภีร์ประจำวันค่ะ'
      );
    };

    box.querySelectorAll('[data-slot-on]').forEach((chk) => {
      chk.onchange = () => {
        const c = loadNoti();
        c.slots[+chk.dataset.slotOn].on = chk.checked;
        saveNoti(c);
      };
    });

    box.querySelectorAll('[data-slot-time]').forEach((inp) => {
      inp.onchange = () => {
        const c = loadNoti();
        c.slots[+inp.dataset.slotTime].time = inp.value || '20:00';
        saveNoti(c);
      };
    });

    document.getElementById('notiTestBtn').onclick = () => {
      fireNotification(
        'ทุ่งพระวาจา · ทดสอบการแจ้งเตือน',
        'พระวาจาของพระองค์เป็นตะเกียงส่องทางเดิน — สดุดี 119:105'
      );
    };

    document.getElementById('notiSoundBtn').onclick = () => {
      const c = loadNoti();
      c.sound = !c.sound;
      saveNoti(c);
      if (c.sound) playGentleChime();
      renderNotiCard();
    };
  }

  function checkReminders() {
    const cfg = loadNoti();
    if (!cfg.enabled) return;

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const nowMin = now.getHours() * 60 + now.getMinutes();

    let changed = false;
    cfg.slots.forEach((slot) => {
      if (!slot.on || !slot.time) return;
      const [hh, mm] = slot.time.split(':').map(Number);
      const targetMin = hh * 60 + mm;
      const logKey = `${todayKey}_${slot.id}`;

      // แจ้งเตือนเมื่อถึงเวลาที่ตั้งไว้ (ภายในช่วง 60 นาทีของวันนั้น และยังไม่เคยส่งซ้ำ)
      if (nowMin >= targetMin && nowMin - targetMin <= 60 && !cfg.sentLog[logKey]) {
        cfg.sentLog[logKey] = true;
        changed = true;
        fireNotification(
          `ทุ่งพระวาจา · ${slot.label}`,
          'ได้เวลาพักใจกับพระเจ้า อ่านพระคัมภีร์ และสวดภาวนาของวันนี้นะคะ',
          `tpw-${slot.id}`
        );
      }
    });

    if (changed) saveNoti(cfg);
  }

  // ลงทะเบียน Service Worker และเริ่มตรวจสอบเวลาแจ้งเตือน
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  renderNotiCard();
  checkReminders();
  setInterval(checkReminders, 20000);
})();
