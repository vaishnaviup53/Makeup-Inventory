# Makeup Inventory

A simple, responsive web app for keeping track of makeup products you own and products you want to buy.

## Features

- Add and edit products with a brand, category, price, quantity, and notes.
- Keep products in your collection or add them to your wishlist.
- See collection and wishlist totals in Indian rupees (INR).
- Search products and filter by category.
- Save your data in your browser using local storage.

## Run locally

From this project folder, start a local web server:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. If `py` is not available, try:

```powershell
python -m http.server 8000
```

Press `Ctrl+C` in the terminal to stop the server.

## Project files

- `index.html` — app structure and form
- `styles.css` — layout and styling
- `app.js` — inventory, wishlist, and browser storage logic

Your inventory is stored in the browser on the device you use. It is not automatically synced between devices.
