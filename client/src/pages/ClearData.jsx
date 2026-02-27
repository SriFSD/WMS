import { closePersistentDbConnection } from "../hooks/usePersistentState";

export default function ClearData() {
  const handleClearData = () => {
    const isConfirmed = window.confirm(
      "This will permanently delete all app data. Do you want to continue?",
    );

    if (!isConfirmed) {
      alert("Clear data canceled");
      return;
    }

    // Close the current tab's DB connection before deletion to avoid "blocked".
    closePersistentDbConnection();
    const request = window.indexedDB.deleteDatabase("warehouse-management-db");

    request.onsuccess = () => {
      alert("All data cleared successfully");
      window.location.reload();
    };

    request.onerror = () => {
      alert("Failed to clear data. Please close other tabs and try again.");
    };

    request.onblocked = () => {
      alert(
        "Database is blocked by another open tab/window. Close all app tabs and try again.",
      );
    };
  };

  return (
    <div className="clear-data-page">
      <h1 className="page-title">Clear Data</h1>
      <section className="clear-data-card">
        <h3>Danger Zone</h3>
        <p>
          This action removes customers, products, orders, deliveries and
          payments from your local browser storage.
        </p>
        <p>This cannot be undone.</p>
        <button className="danger-btn" onClick={handleClearData}>
          Clear All Data
        </button>
      </section>
    </div>
  );
}
