export function buildLocalizedSelectOptions(options, labels) {
  return options.map((option) => ({
    value: option.value,
    text: labels[option.value] || option.text,
  }));
}

export function replaceSelectOptions(select, labels) {
  const options = buildLocalizedSelectOptions(
    Array.from(select.options).map((option) => ({
      value: option.value,
      text: option.textContent,
    })),
    labels,
  );

  const currentValue = select.value;
  select.innerHTML = options.map((option) => {
    return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.text) + '</option>';
  }).join('');
  select.value = currentValue;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
