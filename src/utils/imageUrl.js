export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Already absolute

    // Get base URL from environment or default to localhost
    // We need to strip '/api' if it exists in the base URL because static files are at root
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://localhost:7071/api";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");

    // Ensure path starts with /
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
