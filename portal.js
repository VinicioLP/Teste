const form = document.querySelector("#lookup-form");
const input = document.querySelector("#token-input");
const statusCard = document.querySelector("#status-card");
const emptyCard = document.querySelector("#empty-card");
const errorCard = document.querySelector("#error-card");
const timeline = document.querySelector("#timeline");

const formatDate = (value) => {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const setText = (selector, value) => {
  document.querySelector(selector).textContent = value || "-";
};

const showOnly = (target) => {
  [statusCard, emptyCard, errorCard].forEach((card) => card.classList.add("hidden"));
  target.classList.remove("hidden");
};

const renderTimeline = (items) => {
  timeline.replaceChildren();
  if (!items.length) {
    const item = document.createElement("li");
    item.textContent = "Nenhuma movimentacao publica registrada ainda.";
    timeline.appendChild(item);
    return;
  }

  items.forEach((entry) => {
    const item = document.createElement("li");
    const time = document.createElement("time");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    const description = document.createElement("p");

    time.textContent = formatDate(entry.changed_at);
    title.textContent = entry.label || entry.status || "-";
    description.textContent = entry.description || "";

    content.append(title, description);
    item.append(time, content);
    timeline.appendChild(item);
  });
};

const renderOrder = (data) => {
  setText("#order-number", data.order_number);
  setText("#status-badge", data.status_label);
  setText("#customer-name", data.customer_name);
  setText("#device-name", data.device_name);
  setText("#expected-date", formatDate(data.expected_delivery_date));
  setText("#updated-at", formatDate(data.generated_at));
  setText("#public-title", data.status_label);
  setText("#public-description", data.status_description);
  renderTimeline(data.history || []);
  showOnly(statusCard);
};

const lookup = async (token) => {
  const normalizedToken = (token || "").trim().toUpperCase();
  if (!normalizedToken) {
    showOnly(emptyCard);
    return;
  }

  input.value = normalizedToken;
  try {
    const response = await fetch(`orders/${encodeURIComponent(normalizedToken)}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error("not-found");
    renderOrder(await response.json());
  } catch (_error) {
    showOnly(errorCard);
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookup(input.value);
});

const params = new URLSearchParams(window.location.search);
lookup(params.get("token") || "");
