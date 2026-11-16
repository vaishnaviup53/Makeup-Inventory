const STORAGE_KEY = "petal-makeup-inventory-v1";
const CATEGORIES = ["Face", "Eyes", "Lips", "Skincare", "Tools", "Other"];
const CATEGORY_EMOJI = {
  Face: "🧴",
  Eyes: "🎨",
  Lips: "💄",
  Skincare: "🫧",
  Tools: "🖌️",
  Other: "✨"
};

const elements = {
  addButton: document.querySelector("#open-add"),
  addButtonLabel: document.querySelector("#add-button-label"),
  breadcrumb: document.querySelector("#breadcrumb-view"),
  categoryFilter: document.querySelector("#category-filter"),
  collectionValue: document.querySelector("#collection-value"),
  dialog: document.querySelector("#product-dialog"),
  emptyAdd: document.querySelector("#empty-add"),
  emptyDescription: document.querySelector("#empty-description"),
  emptyIcon: document.querySelector("#empty-icon"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  form: document.querySelector("#product-form"),
  inventoryCount: document.querySelector("#inventory-nav-count"),
  inventorySummaryCaption: document.querySelector("#inventory-summary-caption"),
  inventoryTotal: document.querySelector("#inventory-total"),
  listDescription: document.querySelector("#list-description"),
  listTitle: document.querySelector("#list-title"),
  noResults: document.querySelector("#no-results"),
  pageDescription: document.querySelector("#page-description"),
  pageTitle: document.querySelector("#page-title"),
  productGrid: document.querySelector("#product-grid"),
  resultCount: document.querySelector("#result-count"),
  search: document.querySelector("#search-input"),
  submitLabel: document.querySelector("#submit-label"),
  today: document.querySelector("#today-label"),
  wishlistCount: document.querySelector("#wishlist-nav-count"),
  wishlistSummaryCaption: document.querySelector("#wishlist-summary-caption"),
  wishlistTotal: document.querySelector("#wishlist-total"),
  wishlistValue: document.querySelector("#wishlist-value")
};

let products = loadProducts();
let activeView = "inventory";
let editingId = null;

elements.today.textContent = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric"
}).format(new Date());

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved inventory has an unexpected format.");
    return parsed.filter((product) =>
      product &&
      typeof product.id === "string" &&
      typeof product.name === "string" &&
      typeof product.category === "string" &&
      Number.isFinite(product.price) &&
      Number.isInteger(product.quantity) &&
      product.quantity > 0 &&
      typeof product.wishlist === "boolean"
    );
  } catch (error) {
    console.error("Could not load the saved makeup inventory:", error);
    return [];
  }
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Could not save the makeup inventory:", error);
    window.alert("Your changes could not be saved in this browser. Check your available storage and try again.");
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR"
  }).format(price);
}

function productValue(product) {
  return product.price * product.quantity;
}

function getVisibleProducts() {
  const search = elements.search.value.trim().toLocaleLowerCase();
  const category = elements.categoryFilter.value;

  return products.filter((product) => {
    const belongsToView = product.wishlist === (activeView === "wishlist");
    const matchesCategory = category === "all" || product.category === category;
    const searchText = [product.name, product.brand, product.category, product.notes]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return belongsToView && matchesCategory && searchText.includes(search);
  });
}

function renderSummary() {
  const inventory = products.filter((product) => !product.wishlist);
  const wishlist = products.filter((product) => product.wishlist);
  const inventoryValue = inventory.reduce((sum, product) => sum + productValue(product), 0);
  const wishlistValue = wishlist.reduce((sum, product) => sum + productValue(product), 0);

  elements.inventoryCount.textContent = inventory.length;
  elements.wishlistCount.textContent = wishlist.length;
  elements.inventoryTotal.textContent = inventory.length;
  elements.wishlistTotal.textContent = wishlist.length;
  elements.collectionValue.textContent = formatPrice(inventoryValue);
  elements.wishlistValue.textContent = formatPrice(wishlistValue);
  elements.inventorySummaryCaption.textContent = `${inventory.reduce((sum, product) => sum + product.quantity, 0)} total items in your collection`;
  elements.wishlistSummaryCaption.textContent = `${wishlist.reduce((sum, product) => sum + product.quantity, 0)} total items saved for later`;
}

function renderProduct(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const art = document.createElement("div");
  art.className = `product-art art-${product.category.toLowerCase()}`;

  const category = document.createElement("span");
  category.className = "product-category-pill";
  category.textContent = product.category;

  const emoji = document.createElement("span");
  emoji.className = "product-emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = CATEGORY_EMOJI[product.category] || CATEGORY_EMOJI.Other;

  const price = document.createElement("span");
  price.className = "product-price-badge";
  price.textContent = formatPrice(productValue(product));

  art.append(category, emoji, price);

  const info = document.createElement("div");
  info.className = "product-info";

  const brand = document.createElement("p");
  brand.className = "product-brand";
  brand.textContent = product.brand || "BEAUTY FIND";

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name;

  const notes = document.createElement("p");
  notes.className = "product-notes";
  notes.textContent = product.notes || " ";
  if (product.notes) notes.title = product.notes;

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const quantity = document.createElement("span");
  quantity.textContent = `${product.quantity} ${product.quantity === 1 ? "item" : "items"}`;

  const actions = document.createElement("div");
  actions.className = "product-actions";

  if (product.wishlist) {
    const moveButton = document.createElement("button");
    moveButton.className = "action-button";
    moveButton.type = "button";
    moveButton.dataset.action = "move";
    moveButton.dataset.id = product.id;
    moveButton.textContent = "Got it";
    actions.append(moveButton);
  }

  const editButton = document.createElement("button");
  editButton.className = "action-button";
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.dataset.id = product.id;
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.className = "action-button delete";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = product.id;
  deleteButton.textContent = "Remove";

  actions.append(editButton, deleteButton);
  meta.append(quantity, actions);
  info.append(brand, name, notes, meta);
  card.append(art, info);
  return card;
}

function render() {
  const isWishlist = activeView === "wishlist";
  const visibleProducts = getVisibleProducts();
  elements.productGrid.replaceChildren(...visibleProducts.map(renderProduct));
  elements.resultCount.textContent = visibleProducts.length;
  elements.pageTitle.innerHTML = `${isWishlist ? "My wishlist" : "My collection"}<span class="title-period">.</span>`;
  elements.breadcrumb.textContent = isWishlist ? "WISHLIST" : "MY COLLECTION";
  elements.pageDescription.textContent = isWishlist
    ? "The little treats you have your eye on."
    : "Everything in your makeup bag, all in one lovely place.";
  elements.addButtonLabel.textContent = isWishlist ? "Add to wishlist" : "Add a product";
  elements.listTitle.firstChild.textContent = isWishlist ? "Your wishlist " : "Your products ";
  elements.listDescription.textContent = isWishlist
    ? "Beauty favorites you're dreaming about."
    : "The beauty favorites you already own.";

  const hasProducts = products.some((product) => product.wishlist === isWishlist);
  const hasFilters = elements.search.value.trim() !== "" || elements.categoryFilter.value !== "all";
  const showEmpty = !hasProducts && !hasFilters;
  elements.emptyState.hidden = !showEmpty;
  elements.productGrid.hidden = showEmpty;
  elements.noResults.hidden = visibleProducts.length > 0 || showEmpty;

  if (!hasProducts) {
    elements.emptyIcon.textContent = isWishlist ? "♡" : "✳";
    elements.emptyTitle.textContent = isWishlist ? "Your wishlist is waiting" : "Your collection is a blank canvas";
    elements.emptyDescription.textContent = isWishlist
      ? "Save the products you have your eye on for another day."
      : "Add your first product and start building your beauty edit.";
  }

  renderSummary();
}

function openDialog(product) {
  editingId = product ? product.id : null;
  elements.form.reset();
  document.querySelector("#product-quantity").value = "1";
  document.querySelector("#wishlist-checkbox").checked = product ? product.wishlist : activeView === "wishlist";
  elements.submitLabel.textContent = product ? "Save changes" : "Add to collection";
  document.querySelector("#dialog-title").innerHTML = `${product ? "Edit product" : "Add a product"}<span class="title-period">.</span>`;

  if (product) {
    document.querySelector("#product-name").value = product.name;
    document.querySelector("#product-brand").value = product.brand;
    document.querySelector("#product-category").value = product.category;
    document.querySelector("#product-price").value = product.price;
    document.querySelector("#product-quantity").value = product.quantity;
    document.querySelector("#product-notes").value = product.notes;
  }

  elements.dialog.showModal();
  document.querySelector("#product-name").focus();
}

function closeDialog() {
  elements.dialog.close();
  editingId = null;
}

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link === button);
    });
    elements.search.value = "";
    elements.categoryFilter.value = "all";
    render();
  });
});

elements.addButton.addEventListener("click", () => openDialog());
elements.emptyAdd.addEventListener("click", () => openDialog());
document.querySelector("#close-dialog").addEventListener("click", closeDialog);
document.querySelector("#cancel-dialog").addEventListener("click", closeDialog);
elements.search.addEventListener("input", render);
elements.categoryFilter.addEventListener("change", render);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.form.reportValidity()) return;

  const formData = new FormData(elements.form);
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  if (!Number.isFinite(price) || price < 0 || price > 999999 || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    window.alert("Enter a valid price and a whole-number quantity greater than zero.");
    return;
  }

  const product = {
    id: editingId || (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(formData.get("name")).trim(),
    brand: String(formData.get("brand")).trim(),
    category: CATEGORIES.includes(formData.get("category")) ? String(formData.get("category")) : "Other",
    price,
    quantity,
    notes: String(formData.get("notes")).trim(),
    wishlist: formData.get("wishlist") === "on"
  };

  if (!product.name) {
    document.querySelector("#product-name").focus();
    return;
  }

  if (editingId) {
    products = products.map((existing) => existing.id === editingId ? product : existing);
  } else {
    products.unshift(product);
  }

  saveProducts();
  closeDialog();
  render();
});

elements.productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const product = products.find((item) => item.id === button.dataset.id);
  if (!product) return;

  if (button.dataset.action === "edit") {
    openDialog(product);
  } else if (button.dataset.action === "move") {
    product.wishlist = false;
    saveProducts();
    render();
  } else if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Remove "${product.name}" from your ${product.wishlist ? "wishlist" : "collection"}?`);
    if (!confirmed) return;
    products = products.filter((item) => item.id !== product.id);
    saveProducts();
    render();
  }
});

render();
