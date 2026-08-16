const fs = require('fs');

let html = fs.readFileSync('evaluation.html', 'utf8');

const startTag = '<div class="lvev-e2-cards" id="lvev-e2-panel-lvlup" role="tabpanel" aria-labelledby="lvev-e2-tab-lvlup" data-lvev-e2-panel="lvlup">';
const endTag = '</div><!-- /.lvev-e2-cards -->';

let startIndex = html.indexOf(startTag);
let endIndex = html.indexOf(endTag, startIndex) + endTag.length;

let lvlupBlock = html.substring(startIndex, endIndex);

let starterBlock = lvlupBlock.replace('id="lvev-e2-panel-lvlup"', 'id="lvev-e2-panel-starter" style="display: none;"')
  .replace('aria-labelledby="lvev-e2-tab-lvlup"', 'aria-labelledby="lvev-e2-tab-starter"')
  .replace('data-lvev-e2-panel="lvlup"', 'data-lvev-e2-panel="starter"');

// 25k Starter
starterBlock = starterBlock.replace(
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="25k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$176</p>\n              <p class="lvev-e2-opt-note">Option 2: One-Time Fee</p>\n            </div>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$117/mo</p>\n              <p class="lvev-e2-opt-note">Option 1: Monthly Subscription</p>\n            </div>\n          </div>',
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="25k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt" style="align-items: flex-end; justify-content: center;">\n              <p class="lvev-e2-opt-price">$129</p>\n              <p class="lvev-e2-opt-note">One-Time Fee</p>\n            </div>\n          </div>'
);
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">$1,250</span>', '<span class="lvev-e2-srow-v">$1,000</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">80%</span>', '<span class="lvev-e2-srow-v">100%</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">Every 14 days</span>', '<span class="lvev-e2-srow-v">Every 5 days</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">10% of Balance</span>', '<span class="lvev-e2-srow-v">4%</span>');

// 50k Starter
starterBlock = starterBlock.replace(
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip is-selected" type="button" aria-pressed="true" data-lvev-e2-select="50k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Selected</span>\n            </button>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$302</p>\n              <p class="lvev-e2-opt-note">Option 2: One-Time Fee</p>\n            </div>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$201/mo</p>\n              <p class="lvev-e2-opt-note">Option 1: Monthly Subscription</p>\n            </div>\n          </div>',
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip is-selected" type="button" aria-pressed="true" data-lvev-e2-select="50k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Selected</span>\n            </button>\n            <div class="lvev-e2-opt" style="align-items: flex-end; justify-content: center;">\n              <p class="lvev-e2-opt-price">$194</p>\n              <p class="lvev-e2-opt-note">One-Time Fee</p>\n            </div>\n          </div>'
);
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">$2,500</span>', '<span class="lvev-e2-srow-v">$2,000</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">80%</span>', '<span class="lvev-e2-srow-v">100%</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">Every 14 days</span>', '<span class="lvev-e2-srow-v">Every 5 days</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">10% of Balance</span>', '<span class="lvev-e2-srow-v">4%</span>');

// 100k Starter
starterBlock = starterBlock.replace(
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="100k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$518</p>\n              <p class="lvev-e2-opt-note">Option 2: One-Time Fee</p>\n            </div>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$345/mo</p>\n              <p class="lvev-e2-opt-note">Option 1: Monthly Subscription</p>\n            </div>\n          </div>',
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="100k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt" style="align-items: flex-end; justify-content: center;">\n              <p class="lvev-e2-opt-price">$259</p>\n              <p class="lvev-e2-opt-note">One-Time Fee</p>\n            </div>\n          </div>'
);
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">$5,000</span>', '<span class="lvev-e2-srow-v">$3,000</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">80%</span>', '<span class="lvev-e2-srow-v">100%</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">Every 14 days</span>', '<span class="lvev-e2-srow-v">Every 5 days</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">10% of Balance</span>', '<span class="lvev-e2-srow-v">2.5%</span>');

// 150k Starter
starterBlock = starterBlock.replace(
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="150k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$680</p>\n              <p class="lvev-e2-opt-note">Option 2: One-Time Fee</p>\n            </div>\n            <div class="lvev-e2-opt">\n              <p class="lvev-e2-opt-price">$453/mo</p>\n              <p class="lvev-e2-opt-note">Option 1: Monthly Subscription</p>\n            </div>\n          </div>',
  '<div class="lvev-e2-plan">\n            <button class="lvev-e2-chip" type="button" aria-pressed="false" data-lvev-e2-select="150k">\n              <span class="lvev-e2-chip-dot" aria-hidden="true"></span>\n              <span class="lvev-e2-chip-t">Select</span>\n            </button>\n            <div class="lvev-e2-opt" style="align-items: flex-end; justify-content: center;">\n              <p class="lvev-e2-opt-price">$324</p>\n              <p class="lvev-e2-opt-note">One-Time Fee</p>\n            </div>\n          </div>'
);
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">$7,500</span>', '<span class="lvev-e2-srow-v">$4,500</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">80%</span>', '<span class="lvev-e2-srow-v">100%</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">Every 14 days</span>', '<span class="lvev-e2-srow-v">Every 5 days</span>');
starterBlock = starterBlock.replace('<span class="lvev-e2-srow-v">10% of Balance</span>', '<span class="lvev-e2-srow-v">2%</span>');

html = html.substring(0, endIndex) + '\n\n' + starterBlock + html.substring(endIndex);

// Also we need to fix the button toggling in evaluation.html.
html = html.replace(
  '<button class="lvev-e2-tab" type="button" role="tab" id="lvev-e2-tab-starter"\n              aria-selected="false" tabindex="-1" aria-controls="lvev-e2-panel-lvlup" data-lvev-e2-plan="starter">',
  '<button class="lvev-e2-tab" type="button" role="tab" id="lvev-e2-tab-starter"\n              aria-selected="false" tabindex="-1" aria-controls="lvev-e2-panel-starter" data-lvev-e2-plan="starter">'
);

fs.writeFileSync('evaluation.html', html, 'utf8');
