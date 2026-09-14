(function baumanDeviceAccessGateUi(global) {
  'use strict';

  function deviceTypeLabel() {
    const width = Math.max(global.innerWidth || 0, document.documentElement.clientWidth || 0);
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (navigator.maxTouchPoints > 1 && width >= 600 && width < 1200)) return 'Máy tính bảng';
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 600) return 'Điện thoại';
    return 'Máy tính';
  }

  function osLabel() {
    const ua = navigator.userAgent || '';
    const platform = navigator.userAgentData && navigator.userAgentData.platform ? navigator.userAgentData.platform : '';
    if (/Windows/i.test(platform) || /Windows NT/i.test(ua)) return 'Windows';
    if (/Android/i.test(platform) || /Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS / iPadOS';
    if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(platform) || /Linux/i.test(ua)) return 'Linux';
    return platform || 'Không xác định';
  }

  function browserLabel() {
    const ua = navigator.userAgent || '';
    if (/Edg\//i.test(ua)) return 'Microsoft Edge';
    if (/OPR\//i.test(ua)) return 'Opera';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/CriOS\//i.test(ua)) return 'Google Chrome';
    if (/Chrome\//i.test(ua)) return 'Google Chrome';
    if (/Safari\//i.test(ua) && !/Chrome|Chromium|CriOS/i.test(ua)) return 'Safari';
    return 'Trình duyệt hiện tại';
  }

  function buildMetaCell(label, value, id) {
    const cell = document.createElement('div');
    cell.className = 'bauman-device-meta-cell';
    cell.innerHTML = `<span>${label}</span><strong${id ? ` id="${id}"` : ''}>${value}</strong>`;
    return cell;
  }

  function syncUi(gate) {
    const state = gate.dataset.state || 'checking';
    const statusText = gate.querySelector('#baumanDeviceStatus')?.textContent || 'Đang kiểm tra quyền';
    const statusTop = gate.querySelector('#baumanDeviceStatusTop');
    const statusMeta = gate.querySelector('#baumanDeviceStatusMeta');
    if (statusTop) statusTop.textContent = statusText;
    if (statusMeta) statusMeta.textContent = statusText;
    gate.dataset.uiState = state;
  }

  function enhanceGate(gate) {
    if (!gate || gate.dataset.uiEnhanced === 'true') return;
    const card = gate.querySelector('.bauman-device-card');
    const mark = gate.querySelector('.bauman-device-mark');
    const kicker = gate.querySelector('.bauman-device-kicker');
    const title = gate.querySelector('#baumanDeviceTitle');
    const message = gate.querySelector('#baumanDeviceMessage');
    const codeWrap = gate.querySelector('#baumanDeviceCodeWrap');
    const status = gate.querySelector('.bauman-device-status');
    const retry = gate.querySelector('#baumanDeviceRetry');
    const copy = gate.querySelector('#baumanDeviceCopy');
    const securityNote = card && card.querySelector(':scope > small');
    if (!card || !mark || !kicker || !title || !message || !codeWrap || !status || !retry || !copy) return;

    gate.dataset.uiEnhanced = 'true';
    card.classList.add('bauman-device-card--enhanced');

    const layout = document.createElement('div');
    layout.className = 'bauman-device-layout';
    gate.insertBefore(layout, card);

    const intro = document.createElement('aside');
    intro.className = 'bauman-device-intro';
    intro.innerHTML = [
      '<span class="bauman-device-intro-kicker">BAUMAN MASTER AI · DEVICE ACCESS</span>',
      '<h2>Một thiết bị được duyệt, một phiên học tập an toàn.</h2>',
      '<p>Bauman Hub xác minh danh tính thiết bị trước khi mở lộ trình. Quyền được quản lý tập trung từ Application Management nhưng khóa riêng vẫn nằm trên thiết bị này.</p>',
      '<div class="bauman-device-intro-list">',
      '<div><b>01</b><span><strong>Danh tính riêng</strong><small>Mỗi thiết bị có registry BM- riêng.</small></span></div>',
      '<div><b>02</b><span><strong>Duyệt tập trung</strong><small>Chủ hệ thống duyệt hoặc khóa từ trang quản trị.</small></span></div>',
      '<div><b>03</b><span><strong>Tự kiểm tra quyền</strong><small>Thiết bị đối chiếu lại trạng thái trước khi mở ứng dụng.</small></span></div>',
      '</div>'
    ].join('');
    layout.appendChild(intro);
    layout.appendChild(card);

    const header = document.createElement('div');
    header.className = 'bauman-device-card-head';
    card.insertBefore(header, mark);
    const brand = document.createElement('div');
    brand.className = 'bauman-device-brand';
    header.appendChild(brand);
    brand.appendChild(mark);
    brand.appendChild(kicker);
    const statusPill = document.createElement('div');
    statusPill.className = 'bauman-device-status-pill';
    statusPill.innerHTML = '<i></i><span id="baumanDeviceStatusTop">Đang kiểm tra quyền</span>';
    header.appendChild(statusPill);

    const titleBlock = document.createElement('div');
    titleBlock.className = 'bauman-device-title-block';
    card.insertBefore(titleBlock, title);
    titleBlock.appendChild(title);
    titleBlock.appendChild(message);

    const info = document.createElement('div');
    info.className = 'bauman-device-info';
    info.innerHTML = '<span aria-hidden="true">i</span><p>Thiết bị tự tạo danh tính bảo mật và gửi yêu cầu cấp quyền. Sau khi được duyệt, bấm “Kiểm tra lại quyền” để tiếp tục.</p>';
    codeWrap.insertAdjacentElement('afterend', info);

    const codeLabel = codeWrap.querySelector('span');
    if (codeLabel) codeLabel.textContent = 'MÃ THIẾT BỊ BAUMAN';
    copy.textContent = 'Sao chép mã BM';
    copy.hidden = true;
    retry.textContent = 'Kiểm tra lại quyền';

    const meta = document.createElement('div');
    meta.className = 'bauman-device-meta';
    meta.appendChild(buildMetaCell('LOẠI TỰ NHẬN DIỆN', deviceTypeLabel()));
    meta.appendChild(buildMetaCell('HỆ ĐIỀU HÀNH', osLabel()));
    meta.appendChild(buildMetaCell('TRÌNH DUYỆT', browserLabel()));
    meta.appendChild(buildMetaCell('TRẠNG THÁI', 'Đang kiểm tra quyền', 'baumanDeviceStatusMeta'));
    info.insertAdjacentElement('afterend', meta);

    const actions = document.createElement('div');
    actions.className = 'bauman-device-actions';
    meta.insertAdjacentElement('afterend', actions);
    actions.appendChild(retry);
    const copyAction = document.createElement('button');
    copyAction.type = 'button';
    copyAction.className = 'bauman-device-copy-action';
    copyAction.textContent = 'Sao chép mã BM';
    copyAction.addEventListener('click', () => copy.click());
    actions.appendChild(copyAction);

    status.classList.add('bauman-device-status-detail');
    actions.insertAdjacentElement('afterend', status);

    if (securityNote) {
      securityNote.classList.add('bauman-device-security-note');
      status.insertAdjacentElement('afterend', securityNote);
    }

    const checklist = document.createElement('div');
    checklist.className = 'bauman-device-checklist';
    checklist.innerHTML = [
      '<div><i>✓</i><span>Tự nhận diện Máy tính / Điện thoại / Máy tính bảng</span></div>',
      '<div><i>✓</i><span>Private key P-256 không rời khỏi thiết bị</span></div>',
      '<div><i>✓</i><span>Application Management kiểm tra registry BM- trước khi cấp quyền</span></div>'
    ].join('');
    card.appendChild(checklist);

    syncUi(gate);
    const observer = new MutationObserver(() => syncUi(gate));
    observer.observe(gate, { attributes: true, attributeFilter: ['data-state'], subtree: false });
    const statusText = gate.querySelector('#baumanDeviceStatus');
    if (statusText) observer.observe(statusText, { childList: true, characterData: true, subtree: true });
  }

  function scan() {
    enhanceGate(document.getElementById('baumanDeviceGate'));
  }

  scan();
  const rootObserver = new MutationObserver(scan);
  rootObserver.observe(document.documentElement, { childList: true, subtree: true });
})(window);
