/**
 * Exports JSON data to a CSV string.
 */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map(row =>
            headers.map(header => {
                const cell = row[header] === undefined || row[header] === null ? "" : row[header];
                // Escape quotes and wrap in quotes if contains comma
                const cellStr = String(cell).replace(/"/g, '""');
                return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
            }).join(",")
        )
    ].join("\n");

    return csvContent;
};

/**
 * Triggers a file download in the browser.
 */
export const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
