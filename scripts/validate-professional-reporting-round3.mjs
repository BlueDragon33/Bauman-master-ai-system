import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const main=read('assets/js/academic-main.js');
const css=read('assets/css/academic-2026.css');

function must(value,message){if(!value)throw new Error(message)}

must(
  main.includes("window.confirm('Xóa kết quả diagnostic của '+id+'? Thao tác này không thể hoàn tác.')"),
  'Diagnostic deletion must require explicit destructive-action confirmation.'
);
must(
  css.includes('[data-academic-report]{margin:0!important;break-inside:auto!important;page-break-inside:auto!important}'),
  'Whole academic report must be allowed to paginate.'
);
must(
  css.includes('.academic2026-panel{box-shadow:none!important;border:1px solid #cfd4dc!important;background:#fff!important;color:#111!important;break-inside:auto!important;page-break-inside:auto!important}'),
  'Academic report panel must allow multi-page print flow.'
);
must(!css.includes('[data-academic-report]{margin:0!important;break-inside:avoid}'),'Whole-report break-inside:avoid must not return.');
must(css.includes('.grade14d-row')&&css.includes('.transcript14e-row')&&css.includes('break-inside:avoid'),'Row-level print protection must remain.');
must(css.includes('pointer-events:none!important'),'Printed interactive controls must be non-interactive.');

console.log('PROFESSIONAL_REPORTING_ROUND3_STATIC_PASS');
